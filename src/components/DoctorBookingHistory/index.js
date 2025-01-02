import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';

// Add PatientHistoryModal component
const PatientHistoryModal = ({ patient, history, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Patient History: {patient?.name}</h3>
                    <button 
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
                
                {history.length === 0 ? (
                    <p>No previous appointments found.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={headerStyle}>Date</th>
                                <th style={headerStyle}>Symptoms</th>
                                <th style={headerStyle}>Diagnosis</th>
                                <th style={headerStyle}>Prescription</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record.id}>
                                    <td style={cellStyle}>
                                        {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td style={cellStyle}>{record.symptoms || 'N/A'}</td>
                                    <td style={cellStyle}>{record.diagnosis || 'N/A'}</td>
                                    <td style={cellStyle}>{record.prescription || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const DoctorBookingHistory = () => {
    const history = useHistory();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [patientHistory, setPatientHistory] = useState([]);
    const doctorDetails = JSON.parse(localStorage.getItem('doctorDetails'));

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                // Get doctor details
                const storedDoctorDetails = localStorage.getItem('doctorDetails');
                if (!storedDoctorDetails) {
                    throw new Error('Doctor details not found in localStorage');
                }

                const doctorDetails = JSON.parse(storedDoctorDetails);
                if (!doctorDetails.id) {
                    throw new Error('Doctor ID not found in stored details');
                }

                console.log('Fetching appointments for doctor:', doctorDetails.id);
                
                const response = await fetch(
                    `http://localhost:3009/api/doctor-appointments/${doctorDetails.id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        credentials: 'include'
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Received appointments:', data);

                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format: expected an array');
                }

                setAppointments(data);
                setError(null);

            } catch (error) {
                console.error('Error loading appointments:', error);
                setError(error.message || 'Failed to load appointments');
                setAppointments([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAppointments();
    }, []);

    // Add debug output
    console.log('Current state:', {
        isLoading,
        error,
        appointmentsCount: appointments.length,
        doctorDetails: JSON.parse(localStorage.getItem('doctorDetails'))
    });

    if (isLoading) {
        return (
            <div style={{ 
                padding: '20px',
                textAlign: 'center',
                color: '#666'
            }}>
                Loading appointments...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '20px',
                textAlign: 'center',
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                borderRadius: '4px',
                margin: '20px'
            }}>
                <h3>Error Loading Appointments</h3>
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (appointments.length === 0) {
        return <div style={{ padding: '20px' }}>No appointments found.</div>;
    }

    const viewPatientHistory = async (patientId, patientName) => {
        try {
            const response = await fetch(
                `http://localhost:3009/api/patient-history/${patientId}/${doctorDetails.id}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (Array.isArray(data)) {
                setPatientHistory(data);
                setSelectedPatient({ id: patientId, name: patientName });
                setShowModal(true);
            } else {
                console.error('Received non-array patient history:', data);
                setPatientHistory([]);
                setError('Invalid patient history format received from server');
            }
        } catch (error) {
            console.error('Error fetching patient history:', error);
            setPatientHistory([]);
            setError('Failed to load patient history');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Patient Appointments</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={headerStyle}>Patient Name</th>
                        <th style={headerStyle}>Date</th>
                        <th style={headerStyle}>Time</th>
                        <th style={headerStyle}>Status</th>
                        <th style={headerStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                            <td style={cellStyle}>{appointment.patient_name}</td>
                            <td style={cellStyle}>
                                {new Date(appointment.date).toLocaleDateString()}
                            </td>
                            <td style={cellStyle}>{appointment.time}</td>
                            <td style={cellStyle}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: getStatusColor(appointment.status).bg,
                                    color: getStatusColor(appointment.status).text
                                }}>
                                    {appointment.status}
                                </span>
                            </td>
                            <td style={cellStyle}>
                                <button
                                    onClick={() => viewPatientHistory(appointment.user_id, appointment.patient_name)}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    View History
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showModal && (
                <PatientHistoryModal 
                    patient={selectedPatient}
                    history={patientHistory}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedPatient(null);
                    }}
                />
            )}
        </div>
    );
};

const headerStyle = {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6'
};

const cellStyle = {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed':
            return { bg: '#d4edda', text: '#155724' };
        case 'Upcoming':
            return { bg: '#fff3cd', text: '#856404' };
        default:
            return { bg: '#e2e3e5', text: '#383d41' };
    }
};

export default DoctorBookingHistory;
