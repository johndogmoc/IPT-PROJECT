import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { authenticated, loading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute:', { authenticated, loading });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        console.log('ProtectedRoute: Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('ProtectedRoute: User authenticated, showing content');
    return children;
};

export default ProtectedRoute;
