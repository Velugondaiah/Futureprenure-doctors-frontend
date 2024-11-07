import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import DoctorLogin from './components/DoctorLogin';
import DoctorDashboard from './components/DoctorDashboard';
import UserDashboard from './components/UserDashboard';
import DoctorProfile from './components/DoctorProfile';
import DoctorBookingHistory from './components/DoctorBookingHistory';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <Switch>
          {/* Home Route */}
          <Route exact path="/">
            <div style={{ 
              maxWidth: '800px',
              margin: '0 auto',
              textAlign: 'center',
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{ 
                color: '#333',
                marginBottom: '30px',
                fontSize: '2.5em'
              }}>Welcome to Doctor Portal</h1>
              
              <Link 
                to="/doctor-login"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
              >
                Doctor Login →
              </Link>
            </div>
          </Route>
          
          {/* Doctor Login Route */}
          <Route exact path="/doctor-login">
            <DoctorLogin />
          </Route>

          {/* Doctor Dashboard Route */}
          <Route exact path="/doctor-dashboard">
            <DoctorDashboard />
          </Route>

          {/* User Dashboard Route */}
          <Route exact path="/user-dashboard">
            <UserDashboard />
          </Route>

          {/* Doctor Profile Route */}
          <Route exact path="/doctor-profile">
            <DoctorProfile />
          </Route>

          {/* Doctor Booking History Route */}
          <Route exact path="/doctor-booking-history">
            <DoctorBookingHistory />
          </Route>
          
          {/* 404 Route */}
          <Route path="*">
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              margin: '20px auto',
              maxWidth: '600px'
            }}>
              <h1 style={{ color: '#333' }}>404: Page Not Found</h1>
              <Link 
                to="/"
                style={{
                  color: '#4CAF50',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginTop: '20px'
                }}
              >
                Go Back Home
              </Link>
            </div>
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
