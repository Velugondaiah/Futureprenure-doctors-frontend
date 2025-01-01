import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';

const DoctorDashboard = () => {
    const history = useHistory();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const doctorDetails = JSON.parse(localStorage.getItem('doctorDetails'));

    useEffect(() => {
        const token = Cookies.get('jwt_token');
        if (!token) {
            history.replace('/doctor-login');
        } else {
            fetchAppointments();
        }
    }, [history]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(
                `http://localhost:3009/api/doctor-appointments/${doctorDetails.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('jwt_token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }

            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to load appointments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Cookies.remove('jwt_token');
        localStorage.removeItem('doctorDetails');
        history.replace('/doctor-login');
    };

    const navigateToProfile = () => {
        history.push('/doctor-profile');
    };

    const navigateToBookingHistory = () => {
        history.push('/doctor-booking-history');
    };

    if (!doctorDetails) {
        return null;
    }

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
                    Welcome, Dr. {doctorDetails.name}
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

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                padding: '20px 0'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    ':hover': {
                        transform: 'translateY(-5px)'
                    }
                }}
                onClick={navigateToProfile}
                >
                    <h2 style={{ color: '#333', marginBottom: '15px' }}>Profile</h2>
                    <p style={{ color: '#666' }}>View and manage your profile information</p>
                    <button
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        View Profile
                    </button>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    ':hover': {
                        transform: 'translateY(-5px)'
                    }
                }}
                onClick={navigateToBookingHistory}
                >
                    <h2 style={{ color: '#333', marginBottom: '15px' }}>Booking History</h2>
                    <p style={{ color: '#666' }}>View your appointment history</p>
                    <button
                        style={{
                            marginTop: '15px',
                            padding: '10px 20px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        View History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard; 