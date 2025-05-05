# superset/views/geonode_api.py
from flask import Blueprint, jsonify
import requests

geonode_api = Blueprint('geonode_api', __name__)

@geonode_api.route('/api/geonode/maps', methods=['GET'])
def get_geonode_maps():
    try:
        response = requests.get('https://geonode.streamstech.com/api/maps/')
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
