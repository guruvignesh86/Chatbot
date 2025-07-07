from flask import Blueprint, jsonify

general_bp = Blueprint('general', __name__)

@general_bp.route('/clinic-address', methods=['GET'])
def get_address():
    return jsonify({
        "address": "OrthoCare Clinic, 123 Health Street, Chennai, TN",
        "landmark": "Opposite Apollo Pharmacy",
        "phone": "+91-9876543210"
    })

@general_bp.route('/doctor-availability', methods=['GET'])
def get_availability():
    return jsonify({
        "doctor": "Dr. Raj Kumar mbbs",
        "available_days": "Monday to Saturday",
        "timings": "10 AM – 1 PM, 5 PM – 8 PM"
    })
@general_bp.route("/doctor-info", methods=["GET"])
def doctor_info():
    return jsonify({
        "doctor": "Rajesh Kumar",
        "specialization": "Orthopedic Surgeon",
        "experience": 15
    })
