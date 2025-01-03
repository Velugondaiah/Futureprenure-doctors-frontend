import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import DoctorLogin from './components/DoctorLogin';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorBookingHistory from './components/DoctorBookingHistory';
import DoctorProfile from './components/DoctorProfile';
import VideoRoom from './components/VideoRoom';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        {/* Redirect root to login if not authenticated */}
        <Route exact path="/">
          <Redirect to="/doctor-login" />
        </Route>

        {/* Public routes */}
        <Route exact path="/doctor-login" component={DoctorLogin} />

        {/* Protected routes */}
        <ProtectedRoute exact path="/doctor-dashboard" component={DoctorDashboard} />
        <ProtectedRoute exact path="/doctor-booking-history" component={DoctorBookingHistory} />
        <ProtectedRoute exact path="/doctor-profile" component={DoctorProfile} />
        <ProtectedRoute exact path="/doctor/video-room/:meeting_id" component={VideoRoom} />

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
