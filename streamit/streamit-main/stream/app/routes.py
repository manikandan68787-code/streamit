from flask import Blueprint, render_template, jsonify
from app.services.servicenow_simulator import SNOWSimulator

main_bp = Blueprint('main', __name__)
snow_engine = SNOWSimulator()

@main_bp.route('/')
def index():
    """Render the main SPA dashboard"""
    return render_template('index.html')

@main_bp.route('/api/health')
def health_check():
    """API Health Status"""
    return jsonify({"status": "healthy", "service": "StreamIT Procurement"})
