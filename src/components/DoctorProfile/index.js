import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';

const DoctorProfile = () => {
    const history = useHistory();
    const doctorDetails = JSON.parse(localStorage.getItem('doctorDetails'));
    console.log("jk")
    console.log(doctorDetails)
    useEffect(() => {
        const token = Cookies.get('jwt_token');
        if (!token) {
            history.replace('/doctor-login');
        }
    }, [history]);

    const handleLogout = () => {
        Cookies.remove('jwt_token');
        localStorage.removeItem('doctorDetails');
        history.replace('/doctor-login');
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
                <h1 style={{ margin: 0, color: '#333' }}>Doctor Profile</h1>
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
                    <InfoRow label="Name" value={doctorDetails.name} />
                    <InfoRow label="Username" value={doctorDetails.username} />
                    <InfoRow label="Specialization" value={doctorDetails.specialization} />
                    <InfoRow label="Location" value={doctorDetails.location} />
                    <InfoRow label="Appointment Cost" value={`₹${doctorDetails.cost}`} />
                    <InfoRow label="Rating" value={doctorDetails.rating} />
                    <InfoRow label="Phone Number" value={doctorDetails.number} />
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div style={{
        display: 'flex',
        padding: '15px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
    }}>
        <span style={{ 
            fontWeight: 'bold',
            width: '150px',
            color: '#555'
        }}>{label}:</span>
        <span style={{ color: '#333' }}>{value || 'Not provided'}</span>
    </div>
);

export default DoctorProfile;
