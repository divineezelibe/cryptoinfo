import threading
from flask import Flask, jsonify, render_template
from flask_socketio import SocketIO
from flask_cors import CORS  # Import CORS
import requests
from threading import Thread
import time

app = Flask(__name__, static_url_path='/static')

# Enable CORS for all routes
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading", engineio_logger=True, logger=True, ping_timeout=20, ping_interval=5)
COINCAP_API_BASE_URL = "https://api.coincap.io/v2/"

# Using jinja template to render html along with slider value as input
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to fetch a list of popular cryptocurrencies
@app.route('/api/cryptocurrencies/', methods=['GET'])
def get_cryptocurrencies():
    url = f"{COINCAP_API_BASE_URL}assets/"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        cryptocurrencies = data['data']
        return jsonify(cryptocurrencies)
    return jsonify({"error": "Failed to fetch data from CoinCap API"}), 500

# API endpoint to fetch detailed information about a specific cryptocurrency by id
@app.route('/api/cryptocurrencies/<string:id>/', methods=['GET'])
def get_cryptocurrency(id):
    url = f"{COINCAP_API_BASE_URL}assets/{id}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        cryptocurrency = data['data']
        return jsonify(cryptocurrency)
    return jsonify({"error": "Cryptocurrency not found"}), 404

# API endpoint to fetch historical price data for a specific cryptocurrency by id
@app.route('/api/cryptocurrencies/<string:id>/history/', methods=['GET'])
def get_cryptocurrency_history(id):
    url = f"{COINCAP_API_BASE_URL}assets/{id}/history?interval=d1"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        history = data['data']
        return jsonify(history)
    return jsonify({"error": "Failed to fetch historical data from CoinCap API"}), 500

# Fetch and send real-time updates from CoinCap API
# Emit real-time price updates to connected clients
# API endpoint to establish a WebSocket connection for real-time updates
@socketio.on('connect')
def test_connect():
    socketio.start_background_task(fetch_and_emit_real_time_updates)

def fetch_and_emit_real_time_updates():
        # Fetch real-time data from CoinCap API
        while True:
            response = requests.get(f"{COINCAP_API_BASE_URL}assets?limit=50")
            if response.status_code == 200:
                data = response.json()
                cryptocurrencies = data['data']
                
                # Extract relevant data and send it over WebSocket
                real_time_data = []
                for crypto in cryptocurrencies:
                    name = crypto['name']
                    priceUsd = float(crypto['priceUsd'])
                    changePercent24Hr = float(crypto['changePercent24Hr'])
                    real_time_data.append({"name": name, "priceUsd": priceUsd, "changePercent24Hr": changePercent24Hr})
                
                # Emit real-time updates to connected clients
                socketio.emit('real_price_update', real_time_data)
        
            socketio.sleep(10)  # Fetch and emit updates every 10 seconds



# Run the app
if __name__ == '__main__':
    socketio.run(app)
