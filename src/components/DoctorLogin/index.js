import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';

const DoctorLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    const onSubmitForm = async (event) => {
        event.preventDefault();
        
        // Prevent multiple submissions
        if (isLoading) {
            return;
        }
            //
        setIsLoading(true);
        setErrorMsg('');

        try {
            console.log('Attempting to connect to:', 'https://backend-diagno.onrender.com/doctor-login'); // Debug log
            
            const response = await fetch('https://backend-diagno.onrender.com/doctor-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    username, 
                    password 
                }),
                credentials: 'include'
            });

            console.log('Response received:', response.status); // Debug log

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data.doctor)
            console.log('Login successful:', data); // Debug log
            
            if (data.jwt_token) {
                // Store the JWT token
                Cookies.set('jwt_token', data.jwt_token, { expires: 30 });
                
                // Store doctor details
                const doctorDetails = {
                    id: data.doctor.id,
                    name: data.doctor.name,
                    username:data.doctor.username,
                    specialization: data.doctor.specialization,
                    location:data.doctor.location,
                    cost:data.doctor.appointment_cost,
                    rating:data.doctor.rating,
                    number:data.doctor.phone_number

                };
                console.log("nnnn")
                console.log(doctorDetails)
                console.log('Storing doctor details:', doctorDetails); // Debug log
                localStorage.setItem('doctorDetails', JSON.stringify(doctorDetails));
                
                // Redirect to dashboard
                history.push('/doctor-dashboard');
            } else {
                setErrorMsg(data.error || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.message === 'Failed to fetch') {
                setErrorMsg('Unable to connect to server. Please check if the server is running on port 3009');
            } else {
                setErrorMsg(error.message || 'An error occurred during login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: '#f5f5f5',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <form onSubmit={onSubmitForm} style={{
                background: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    color: '#333',
                    marginBottom: '30px'
                }}>Doctor Login</h1>

                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="username" style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#555'
                    }}>Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#555'
                    }}>Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {errorMsg && <p style={{
                    color: '#ff0000',
                    textAlign: 'center',
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#ffe6e6',
                    borderRadius: '4px'
                }}>{errorMsg}</p>}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: isLoading ? '#cccccc' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>

                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    Test credentials:<br />
                    Username: drsmith<br />
                    Password: password123
                </div>
            </form>
        </div>
    );
};

export default DoctorLogin;