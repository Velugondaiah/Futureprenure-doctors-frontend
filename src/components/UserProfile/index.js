import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';

const UserProfile = () => {
    const history = useHistory();
    const userDetails = JSON.parse(localStorage.getItem('userData'));

    useEffect(() => {
        const token = Cookies.get('jwt_token');
        if (!token) {
            history.replace('/login');
        }
    }, [history]);

    const handleLogout = () => {
        Cookies.remove('jwt_token');
        localStorage.removeItem('userData');
        history.replace('/login');
    };

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
                    My Profile
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
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
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
        </div>
    );
};

export default UserProfile; 