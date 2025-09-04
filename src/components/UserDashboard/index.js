import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
const API_URL = process.env.REACT_APP_API_URL;
// Define InfoRow component at the top
const InfoRow = ({ label, value }) => (
    <div style={{
        display: 'flex',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0'
    }}>
        <span style={{ 
            fontWeight: 'bold',
            width: '150px',
            color: '#555'
        }}>{label}:</span>
        <span style={{ color: '#333' }}>{value || 'Not provided'}</span>
    </div>
);

// Define styles at the top
const headerStyle = {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    color: '#495057',
    fontWeight: 'bold'
};

const cellStyle = {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
};

const UserDashboard = () => {
    const history = useHistory();
    const [activeTab, setActiveTab] = useState('profile');
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userDetails = JSON.parse(localStorage.getItem('userData'));

    useEffect(() => {
        const token = Cookies.get('jwt_token');
        if (!token) {
            history.replace('/login');
        } else {
            fetchAppointments();
        }
    }, [history]);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/user-appointments/${userDetails.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('jwt_token')}`
                    }
                }
            );
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Cookies.remove('jwt_token');
        localStorage.removeItem('userData');
        history.replace('/login');
    };

    const ProfileSection = () => (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ 
                color: '#333',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '2px solid #f0f0f0'
            }}>Profile Information</h2>
            <div style={{ 
                display: 'grid',
                gap: '15px'
            }}>
                <InfoRow label="Username" value={userDetails.username} />
                <InfoRow label="First Name" value={userDetails.firstname} />
                <InfoRow label="Last Name" value={userDetails.lastname} />
                <InfoRow label="Email" value={userDetails.email} />
                <InfoRow label="Phone Number" value={userDetails.phoneNumber} />
                <InfoRow label="Date of Birth" value={userDetails.dateOfBirth} />
                <InfoRow label="Gender" value={userDetails.gender} />
            </div>
        </div>
    );

    const AppointmentsSection = () => (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ 
                color: '#333',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '2px solid #f0f0f0'
            }}>Appointment History</h2>
            
            {isLoading ? (
                <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '20px'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={headerStyle}>Date</th>
                                <th style={headerStyle}>Time</th>
                                <th style={headerStyle}>Doctor</th>
                                <th style={headerStyle}>Specialization</th>
                                <th style={headerStyle}>Location</th>
                                <th style={headerStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment, index) => (
                                <tr key={appointment.id} style={{
                                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                                }}>
                                    <td style={cellStyle}>
                                        {new Date(appointment.date).toLocaleDateString()}
                                    </td>
                                    <td style={cellStyle}>{appointment.time}</td>
                                    <td style={cellStyle}>Dr. {appointment.doctor_name}</td>
                                    <td style={cellStyle}>{appointment.specialist}</td>
                                    <td style={cellStyle}>{appointment.location}</td>
                                    <td style={cellStyle}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: appointment.status === 'Completed' ? '#d4edda' : '#fff3cd',
                                            color: appointment.status === 'Completed' ? '#155724' : '#856404'
                                        }}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div style={{
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ margin: 0, color: '#333' }}>
                    Welcome, {userDetails.firstname}
                </h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'profile' ? '#4CAF50' : '#f0f0f0',
                        color: activeTab === 'profile' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('appointments')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'appointments' ? '#4CAF50' : '#f0f0f0',
                        color: activeTab === 'appointments' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Appointments
                </button>
            </div>

            {activeTab === 'profile' ? <ProfileSection /> : <AppointmentsSection />}
        </div>
    );
};

export default UserDashboard;