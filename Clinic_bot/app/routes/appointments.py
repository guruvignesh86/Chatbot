
from flask import Blueprint, request, jsonify
from app import db
from app.models import Appointment
from datetime import datetime

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('/book-appointment', methods=['POST'])
def book_appointment():
    data = request.get_json()
    name = data.get('name')
    contact = data.get('contact')
    date_str = data.get('date')  
    time_str = data.get('time')  


    if not all([name, contact, date_str, time_str]):
        return jsonify({"error": "Missing fields"}), 400

    
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        if date_obj.weekday() == 6:  # Sunday = 6
            return jsonify({"error": "Clinic is closed on Sundays. Please select another date."}), 400
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

  
    time_str_clean = time_str.replace('.', ':')  # Handle '3.00 PM' → '3:00 PM'
    try:
        time_obj = datetime.strptime(time_str_clean, "%I:%M %p").time()
        opening_time = datetime.strptime("08:00 AM", "%I:%M %p").time()
        closing_time = datetime.strptime("08:00 PM", "%I:%M %p").time()

        if not (opening_time <= time_obj <= closing_time):
            return jsonify({
                "reschedule": True,
                "error": "Bookings are allowed only between 8:00 AM and 8:00 PM. Please reschedule your time."
            }), 400
    except ValueError:
        return jsonify({"error": "Invalid time format. Use 'HH:MM AM/PM' (e.g., 10:30 AM or 3:00 PM)."}), 400

    # ✅ Prevent Double Booking
    existing = Appointment.query.filter_by(preferred_date=date_str, preferred_time=time_str).first()
    if existing:
        return jsonify({
            "error": "This time slot is already booked. Please choose another."
        }), 409

    # ✅ Save to DB
    appointment = Appointment(
        patient_name=name,
        contact_number=contact,
        preferred_date=date_str,
        preferred_time=time_str
    )
    db.session.add(appointment)
    db.session.commit()

    return jsonify({
        "message": "Appointment booked successfully!",
        "appointment_id": appointment.id
    }), 200





