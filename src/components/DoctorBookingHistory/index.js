import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';

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
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(
                `http://localhost:3008/api/doctor-appointments/${doctorDetails.id}`
            );
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            setError('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const viewPatientHistory = async (patientId, patientName) => {
        try {
            const response = await fetch(
                `http://localhost:3008/api/patient-history/${patientId}/${doctorDetails.id}`
            );
            const data = await response.json();
            setPatientHistory(data);
            setSelectedPatient({ id: patientId, name: patientName });
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching patient history:', error);
        }
    };

    const PatientHistoryModal = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '80%',
                maxWidth: '900px',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2>Booking History for {selectedPatient?.name}</h2>
                    <button
                        onClick={() => setShowModal(false)}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>

                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                }}>
                    <thead>
                        <tr>
                            <th style={headerStyle}>Date</th>
                            <th style={headerStyle}>Time</th>
                            <th style={headerStyle}>Status</th>
                            <th style={headerStyle}>Symptoms</th>
                            <th style={headerStyle}>Prescription</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patientHistory.map((appointment) => (
                            <tr key={appointment.id}>
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
                                <td style={cellStyle}>{appointment.symptoms || 'Not provided'}</td>
                                <td style={cellStyle}>{appointment.prescription || 'Not provided'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h2>Patient Appointments</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
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
            )}
            {showModal && <PatientHistoryModal />}
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
