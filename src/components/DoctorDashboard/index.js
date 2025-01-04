import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';

const DoctorDashboard = () => {
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const doctorDetails = localStorage.getItem('doctorDetails');
        if (!doctorDetails) {
            history.push('/doctor-login');
            return;
        }
        setDoctorInfo(JSON.parse(doctorDetails));
        setIsLoading(false);
    }, [history]);

    const handleLogout = () => {
        localStorage.removeItem('doctorDetails');
        Cookies.remove('jwt_token');
        history.push('/doctor-login');
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Doctor Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </nav>
            
            <div className="dashboard-content">
                {doctorInfo && (
                    <div className="doctor-info">
                        <h2>Welcome, Dr. {doctorInfo.name}</h2>
                        <p>Specialization: {doctorInfo.specialist}</p>
                    </div>
                )}
                
                <div className="dashboard-actions">
                    <Link to="/doctor-booking-history" className="dashboard-link">
                        View Appointments
                    </Link>
                    {/* Add more dashboard actions as needed */}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard; 