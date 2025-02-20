import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';

const DoctorDashboard = () => {
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            try {
                const token = Cookies.get('jwt_token');
                const response = await fetch('https://backend-diagno-1.onrender.com/api/doctor/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setDoctorInfo(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching doctor details:', error);
                setIsLoading(false);
            }
        };

        fetchDoctorDetails();
    }, []);

    const handleLogout = () => {
        Cookies.remove('jwt_token');
        history.push('/doctor-login');
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <h1>Doctor Dashboard</h1>
                    {doctorInfo && <p className="welcome-text">Welcome, Dr. {doctorInfo.name}</p>}
                </div>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </nav>
            
            <div className="dashboard-grid">
                <div className="dashboard-card profile-card">
                    <div className="card-icon">👨‍⚕️</div>
                    <h2>Profile</h2>
                    <p>View and manage your professional profile</p>
                    <Link to="/doctor-profile" className="card-button">
                        View Profile
                    </Link>
                </div>

                <div className="dashboard-card appointments-card">
                    <div className="card-icon">📅</div>
                    <h2>Appointments</h2>
                    <p>Check your upcoming and past appointments</p>
                    <Link to="/doctor-booking-history" className="card-button">
                        View Appointments
                    </Link>
                </div>

                <div className="dashboard-card stats-card">
                    <div className="card-icon">📊</div>
                    <h2>Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">25</span>
                            <span className="stat-label">Total Patients</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">12</span>
                            <span className="stat-label">This Week</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">4.8</span>
                            <span className="stat-label">Rating</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card schedule-card">
                    <div className="card-icon">⏰</div>
                    <h2>Today's Schedule</h2>
                    <div className="schedule-list">
                        <div className="schedule-item">
                            <span className="time">09:00 AM</span>
                            <span className="patient">John Doe</span>
                            <span className="type">Online</span>
                        </div>
                        <div className="schedule-item">
                            <span className="time">11:30 AM</span>
                            <span className="patient">Jane Smith</span>
                            <span className="type">In-Person</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard; 