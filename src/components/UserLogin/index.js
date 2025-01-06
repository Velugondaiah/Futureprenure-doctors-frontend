import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    const onSubmitForm = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            console.log('Attempting to connect to:', 'https://backend-diagno.onrender.com/login');
            
            const response = await fetch('https://backend-diagno.onrender.com/doctor-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                Cookies.set('jwt_token', data.jwt_token, { expires: 30 });
                localStorage.setItem('userDetails', JSON.stringify(data.user));
                history.push('/user-dashboard'); // or wherever you want to redirect after login
            } else {
                setErrorMsg(data.error || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg('Failed to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-login-container" style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
            <form className="user-login-form" onSubmit={onSubmitForm} style={{
                background: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                marginTop: '50px'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    color: '#333',
                    marginBottom: '30px'
                }}>User Login</h1>
                
                <div style={{marginBottom: '20px'}}>
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

                <div style={{marginBottom: '20px'}}>
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

                <button
                    type="submit"
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default UserLogin; 