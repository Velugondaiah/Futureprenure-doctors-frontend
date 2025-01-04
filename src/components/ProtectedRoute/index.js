import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        const token = Cookies.get('jwt_token');
        const doctorDetails = localStorage.getItem('doctorDetails');

        if (!token || !doctorDetails) {
          // Redirect to login if not authenticated
          return <Redirect to="/doctor-login" />;
        }

        // Render component if authenticated
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute; 