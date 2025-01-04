import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';

const DoctorBookingHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const history = useHistory();

    useEffect(() => {
        // Check if doctor is logged in
        const doctorDetails = localStorage.getItem('doctorDetails');
        const jwtToken = Cookies.get('jwt_token');

        if (!doctorDetails || !jwtToken) {
            console.log('No doctor details or token found');
            history.push('/doctor-login');
            return;
        }

        fetchAppointments();
        const interval = setInterval(fetchAppointments, 60000);
        return () => clearInterval(interval);
    }, [history]);

    const fetchAppointments = async () => {
        try {
            const doctorDetails = JSON.parse(localStorage.getItem('doctorDetails'));
            if (!doctorDetails || !doctorDetails.id) {
                throw new Error('Doctor details not found');
            }

            console.log('Fetching appointments for doctor:', doctorDetails.id);

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
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch appointments');
            }

            const data = await response.json();
            console.log('Fetched appointments:', data);
            setAppointments(Array.isArray(data) ? data : []);
            setError(null);

        } catch (error) {
            console.error('Error fetching appointments:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="doctor-appointments-container">
            <h1>My Appointments</h1>
            {error && (
                <div className="error-message">
                    {error}
                    <button 
                        onClick={fetchAppointments} 
                        className="retry-button"
                    >
                        Retry
                    </button>
                </div>
            )}
            {isLoading ? (
                <div className="loading">Loading appointments...</div>
            ) : appointments.length === 0 ? (
                <div className="no-appointments">
                    No appointments found
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default DoctorBookingHistory;
