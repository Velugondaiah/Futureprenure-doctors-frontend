import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';

const DoctorBookingHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            const doctorDetails = JSON.parse(localStorage.getItem('doctorDetails'));
            if (!doctorDetails || !doctorDetails.id) {
                throw new Error('Doctor details not found');
            }

            const response = await fetch(
                `http://localhost:3009/api/doctor-appointments/${doctorDetails.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('jwt_token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }

            const data = await response.json();
            console.log('Fetched appointments:', data); // Debug log
            setAppointments(data);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 60000);
        return () => clearInterval(interval);
    }, []);

    const isAppointmentTime = (date, time) => {
        const appointmentDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        
        // Allow access 15 minutes before and up to 30 minutes after start time
        const fifteenMinutesBefore = 15 * 60 * 1000;
        const thirtyMinutesAfter = 30 * 60 * 1000;
        
        return now >= (appointmentDateTime - fifteenMinutesBefore) && 
               now <= (appointmentDateTime.getTime() + thirtyMinutesAfter);
    };

    const renderAppointmentAction = (appointment) => {
        if (!appointment.mode || appointment.mode !== 'Online') {
            return <span className="badge in-person">In-person Visit</span>;
        }

        if (!appointment.meeting_id) {
            console.error('No meeting ID for appointment:', appointment);
            return <span className="badge error">No meeting ID available</span>;
        }

        if (isAppointmentTime(appointment.date, appointment.time)) {
            return (
                <Link 
                    to={`/doctor/video-room/${appointment.meeting_id}`}
                    className="join-call-button"
                >
                    Join Video Call
                </Link>
            );
        }

        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const now = new Date();

        if (now < appointmentDateTime) {
            return <span className="badge upcoming">Upcoming</span>;
        } else {
            return <span className="badge completed">Completed</span>;
        }
    };

    if (isLoading) {
        return <div className="loading">Loading appointments...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="doctor-appointments-container">
            <h1>My Appointments</h1>
            <div className="table-container">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Mode</th>
                            <th>Status/Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>{appointment.patient_name}</td>
                                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                                <td>{appointment.time}</td>
                                <td>
                                    <span className={`mode-badge ${appointment.mode?.toLowerCase()}`}>
                                        {appointment.mode || 'In-person'}
                                    </span>
                                </td>
                                <td className="action-cell">
                                    {renderAppointmentAction(appointment)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DoctorBookingHistory;
