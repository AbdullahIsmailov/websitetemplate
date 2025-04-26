from flask import Flask, render_template, jsonify, send_from_directory
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='Website')

# Cache for oil prices
oil_prices_cache = {
    'brent': None,
    'wti': None,
    'last_updated': None
}

def fetch_oil_price(symbol):
    try:
        # Using Alpha Vantage API
        api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        if not api_key:
            print("Error: ALPHA_VANTAGE_API_KEY not found in environment variables")
            return {
                'error': 'API key not configured. Please set ALPHA_VANTAGE_API_KEY in .env file',
                'last_updated': datetime.now().isoformat()
            }
            
        url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
        print(f"Attempting to fetch price for {symbol}")
        
        try:
            response = requests.get(url, timeout=10)  # Add timeout
            print(f"Response status code: {response.status_code}")
            print(f"Response headers: {response.headers}")
            
            if response.status_code != 200:
                print(f"Error: API returned status code {response.status_code}")
                return {
                    'error': f'API returned status code {response.status_code}',
                    'last_updated': datetime.now().isoformat()
                }
                
            data = response.json()
            print(f"API Response data: {data}")
            
            # Check for API rate limit or other errors
            if 'Note' in data:
                print(f"API Rate Limit: {data['Note']}")
                return {
                    'error': 'API rate limit exceeded. Please try again in a minute.',
                    'last_updated': datetime.now().isoformat()
                }
                
            if 'Error Message' in data:
                print(f"API Error: {data['Error Message']}")
                return {
                    'error': data['Error Message'],
                    'last_updated': datetime.now().isoformat()
                }
                
            if 'Global Quote' in data and data['Global Quote']:
                try:
                    quote_data = data['Global Quote']
                    print(f"Processing quote data: {quote_data}")
                    
                    price = float(quote_data['05. price'])
                    change = float(quote_data['09. change'])
                    change_percent = float(quote_data['10. change percent'].replace('%', ''))
                    
                    print(f"Processed values - Price: {price}, Change: {change}, Change%: {change_percent}")
                    
                    return {
                        'price': price,
                        'change': change,
                        'change_percent': change_percent,
                        'last_updated': datetime.now().isoformat()
                    }
                except (KeyError, ValueError) as e:
                    print(f"Error parsing price data: {str(e)}")
                    print(f"Quote data structure: {quote_data}")
                    return {
                        'error': f'Invalid price data format: {str(e)}',
                        'last_updated': datetime.now().isoformat()
                    }
                
            print(f"Error: No valid price data in response for {symbol}")
            return {
                'error': 'No valid price data available',
                'last_updated': datetime.now().isoformat()
            }
        except requests.exceptions.RequestException as e:
            print(f"Request error: {str(e)}")
            return {
                'error': f'Failed to fetch data: {str(e)}',
                'last_updated': datetime.now().isoformat()
            }
            
    except Exception as e:
        print(f"Unexpected error fetching {symbol} price: {str(e)}")
        return {
            'error': str(e),
            'last_updated': datetime.now().isoformat()
        }

@app.route('/')
def index():
    return send_from_directory('Website', 'ru.html')

@app.route('/kz.html')
def kazakh_version():
    return send_from_directory('Website', 'kz.html')

@app.route('/en.html')
def english_version():
    return send_from_directory('Website', 'en.html')

@app.route('/<path:filename>')
def serve_static(filename):
    if filename.startswith('images/'):
        return send_from_directory('Website/images', filename.split('/')[-1])
    return send_from_directory('Website', filename)

@app.route('/api/oil-prices')
def get_oil_prices():
    global oil_prices_cache
    
    try:
        print("Checking API key...")
        api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        if not api_key:
            print("No API key found!")
            return jsonify({
                'error': 'API key not configured. Please set ALPHA_VANTAGE_API_KEY in .env file',
                'last_updated': datetime.now().isoformat()
            }), 500
            
        print("Checking cache...")
        # Check if cache is valid (less than 5 minutes old)
        if (oil_prices_cache['last_updated'] and 
            datetime.fromisoformat(oil_prices_cache['last_updated']) > datetime.now() - timedelta(minutes=5)):
            print("Returning cached data")
            return jsonify(oil_prices_cache)
        
        print("Fetching new prices...")
        # Fetch new prices
        brent = fetch_oil_price('BZ=F')  # Brent Crude futures
        wti = fetch_oil_price('CL=F')    # WTI Crude futures
        
        print(f"Brent data: {brent}")
        print(f"WTI data: {wti}")
        
        # Update cache with new data
        if 'error' not in brent:
            oil_prices_cache['brent'] = brent
        if 'error' not in wti:
            oil_prices_cache['wti'] = wti
            
        oil_prices_cache['last_updated'] = datetime.now().isoformat()
        
        return jsonify(oil_prices_cache)
        
    except Exception as e:
        print(f"Error in get_oil_prices: {str(e)}")
        # Return cached data if available, otherwise return error
        if oil_prices_cache['last_updated']:
            return jsonify(oil_prices_cache)
        return jsonify({
            'error': str(e),
            'last_updated': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(debug=True) 