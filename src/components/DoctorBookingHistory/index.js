import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';
import { FaClipboardList } from 'react-icons/fa';

const DoctorBookingHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prescription, setPrescription] = useState('');
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [availableTests, setAvailableTests] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [testsError, setTestsError] = useState(null);
    const history = useHistory();
///
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
        fetchDiagnosisTests();
        return () => {
            clearInterval(interval);
        };
    }, [history]);

    const fetchAppointments = async () => {
        try {
            const doctorDetails = JSON.parse(localStorage.getItem('doctorDetails'));
            if (!doctorDetails || !doctorDetails.id) {
                throw new Error('Doctor details not found');
            }

            console.log('Attempting to fetch appointments for doctor:', doctorDetails.id);

            const response = await fetch(
                `https://backend-diagno-1.onrender.com/api/doctor-appointments/${doctorDetails.id}`,
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

    const fetchDiagnosisTests = async () => {
        try {
            console.log('Fetching diagnosis tests...');
            const response = await fetch('https://backend-diagno-1.onrender.com/api/diagnosis-tests', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('jwt_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const tests = await response.json();
            console.log('Received tests:', tests);

            if (!Array.isArray(tests)) {
                throw new Error('Received invalid tests data');
            }

            if (tests.length === 0) {
                setTestsError('No diagnosis tests found in the database');
            } else {
                setAvailableTests(tests);
                setTestsError(null);
            }
        } catch (error) {
            console.error('Error fetching diagnosis tests:', error);
            setTestsError('Failed to fetch diagnosis tests');
            setAvailableTests([]);
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
                `https://backend-diagno-1.onrender.com/api/appointments/${selectedAppointment.id}/prescription`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Cookies.get('jwt_token')}`
                    },
                    body: JSON.stringify({ 
                        prescription,
                        diagnosis_tests: selectedTests 
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update prescription and tests');
            }

            // Update local state
            setAppointments(appointments.map(apt => 
                apt.id === selectedAppointment.id 
                    ? { 
                        ...apt, 
                        prescription, 
                        diagnosis_tests: selectedTests,
                        status: 'Completed' 
                    }
                    : apt
            ));

            // Reset states and close modal
            setShowPrescriptionModal(false);
            setSelectedAppointment(null);
            setPrescription('');
            setSelectedTests([]);

        } catch (error) {
            console.error('Error updating prescription:', error);
            setError('Failed to update prescription and tests');
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
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setPrescription(appointment.prescription || '');
                                                setSelectedTests(appointment.diagnosis_tests || []);
                                                setShowPrescriptionModal(true);
                                            }}
                                            className="prescription-button"
                                        >
                                            <FaClipboardList />
                                            {appointment.prescription ? 'Edit Prescription' : 'Add Prescription'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Prescription Modal */}
            {showPrescriptionModal && (
                <div className="modal-overlay">
                    <div className="prescription-modal">
                        <h2>Add Prescription & Diagnosis Tests</h2>
                        <p>Patient: {selectedAppointment?.patient_name}</p>
                        <p>Date: {new Date(selectedAppointment?.date).toLocaleDateString()}</p>
                        
                        <div className="prescription-section">
                            <h3>Prescription</h3>
                            <textarea
                                value={prescription}
                                onChange={(e) => setPrescription(e.target.value)}
                                placeholder="Enter prescription details..."
                                rows="6"
                                className="prescription-textarea"
                            />
                        </div>

                        <div className="diagnosis-tests-section">
                            <h3>Diagnosis Tests</h3>
                            {testsError ? (
                                <div className="error-message">{testsError}</div>
                            ) : availableTests.length === 0 ? (
                                <div className="no-tests-message">No diagnosis tests available</div>
                            ) : (
                                <div className="tests-grid">
                                    {availableTests.map((test, index) => (
                                        <label key={`${test}-${index}`} className="test-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedTests.includes(test)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedTests([...selectedTests, test]);
                                                    } else {
                                                        setSelectedTests(selectedTests.filter(t => t !== test));
                                                    }
                                                }}
                                            />
                                            <span>{test}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-buttons">
                            <button 
                                onClick={handlePrescriptionSubmit}
                                className="save-button"
                                disabled={!prescription.trim() && selectedTests.length === 0}
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={() => {
                                    setShowPrescriptionModal(false);
                                    setSelectedAppointment(null);
                                    setPrescription('');
                                    setSelectedTests([]);
                                }}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorBookingHistory;
