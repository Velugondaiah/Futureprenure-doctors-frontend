import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';

const DoctorBookingHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prescription, setPrescription] = useState('');
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
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

            console.log('Attempting to fetch appointments for doctor:', doctorDetails.id);

            const response = await fetch(
                `http://localhost:3009/api/doctor-appointments/${doctorDetails.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Cookies.get('jwt_token')}`
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch appointments');
            }

            const data = await response.json();
            console.log('Successfully fetched appointments:', data);
            setAppointments(Array.isArray(data) ? data : []);
            setError(null);

        } catch (error) {
            console.error('Error in fetchAppointments:', error);
            setError('Failed to fetch appointments. Please try again.');
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

    const handlePrescriptionSubmit = async () => {
        try {
            const response = await fetch(
                `http://localhost:3009/api/appointments/${selectedAppointment.id}/prescription`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Cookies.get('jwt_token')}`
                    },
                    body: JSON.stringify({ prescription })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update prescription');
            }

            // Update local state
            setAppointments(appointments.map(apt => 
                apt.id === selectedAppointment.id 
                    ? { ...apt, prescription, status: 'Completed' }
                    : apt
            ));

            // Close modal and reset states
            setShowPrescriptionModal(false);
            setSelectedAppointment(null);
            setPrescription('');

        } catch (error) {
            console.error('Error updating prescription:', error);
            setError('Failed to update prescription');
        }
    };

    const openPrescriptionModal = (appointment) => {
        setSelectedAppointment(appointment);
        setPrescription(appointment.prescription || '');
        setShowPrescriptionModal(true);
    };

    const renderPrescriptionModal = () => {
        if (!showPrescriptionModal) return null;

        return (
            <div className="modal-overlay">
                <div className="prescription-modal">
                    <h2>Add Prescription</h2>
                    <p>Patient: {selectedAppointment?.patient_name}</p>
                    <p>Date: {new Date(selectedAppointment?.date).toLocaleDateString()}</p>
                    
                    <textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        placeholder="Enter prescription details..."
                        rows="6"
                        className="prescription-textarea"
                    />
                    
                    <div className="modal-buttons">
                        <button 
                            onClick={handlePrescriptionSubmit}
                            className="save-button"
                            disabled={!prescription.trim()}
                        >
                            Save Prescription
                        </button>
                        <button 
                            onClick={() => {
                                setShowPrescriptionModal(false);
                                setSelectedAppointment(null);
                                setPrescription('');
                            }}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
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
                                <th>Prescription</th>
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
                                    <td>
                                        <button
                                            onClick={() => openPrescriptionModal(appointment)}
                                            className="prescription-button"
                                        >
                                            {appointment.prescription ? 'Edit Prescription' : 'Add Prescription'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {renderPrescriptionModal()}
        </div>
    );
};

export default DoctorBookingHistory;
