import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import DoctorLogin from './components/DoctorLogin';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorBookingHistory from './components/DoctorBookingHistory';
import DoctorProfile from './components/DoctorProfile';
import VideoRoom from './components/VideoRoom';
import './App.css';
import Cookies from 'js-cookie';

const App = () => {
  // Check if doctor is authenticated
  const isAuthenticated = () => {
    const jwtToken = Cookies.get('jwt_token');
    const doctorDetails = localStorage.getItem('doctorDetails');
    return jwtToken && doctorDetails;
  };

  return (
    <BrowserRouter>
      <Switch>
        {/* Redirect root to login if not authenticated */}
        <Route exact path="/">
          <Redirect to="/doctor-login" />
        </Route>

        {/* Public routes */}
        <Route exact path="/doctor-login" component={DoctorLogin} />

        {/* Regular routes with authentication check */}
        <Route exact path="/doctor-dashboard" 
          render={props => 
            isAuthenticated() ? (
              <DoctorDashboard {...props} />
            ) : (
              <Redirect to="/doctor-login" />
            )
          }
        />

        <Route exact path="/doctor-booking-history" 
          render={props => 
            isAuthenticated() ? (
              <DoctorBookingHistory {...props} />
            ) : (
              <Redirect to="/doctor-login" />
            )
          }
        />

        <Route exact path="/doctor-profile" 
          render={props => 
            isAuthenticated() ? (
              <DoctorProfile {...props} />
            ) : (
              <Redirect to="/doctor-login" />
            )
          }
        />

        <Route path="/doctor/video-room/:meeting_id" component={VideoRoom} />

        {/* 404 route */}
        <Route path="*">
          <div className="not-found">
            <h1>404: Page Not Found</h1>
            <button onClick={() => window.location.href = '/doctor-login'}>
              Go to Login
            </button>
          </div>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
