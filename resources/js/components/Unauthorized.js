import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Auto redirect to login after 5 seconds
        const timer = setTimeout(() => {
            navigate('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="unauthorized-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow-lg border-0">
                            <div className="card-body text-center py-5">
                                <div className="mb-4">
                                    <i className="fas fa-shield-alt text-danger" style={{fontSize: '4rem'}}></i>
                                </div>
                                
                                <h1 className="text-danger mb-3">Unauthorized Access</h1>
                                
                                <p className="text-muted mb-4">
                                    You don't have permission to access this resource. 
                                    Please login with valid credentials to continue.
                                </p>
                                
                                <div className="alert alert-warning mb-4" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Access Denied:</strong> This page requires authentication.
                                </div>
                                
                                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                                    <button 
                                        className="btn btn-primary btn-lg me-md-2"
                                        onClick={handleGoToLogin}
                                    >
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        Go to Login
                                    </button>
                                    
                                    <button 
                                        className="btn btn-outline-secondary btn-lg"
                                        onClick={() => window.history.back()}
                                    >
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Go Back
                                    </button>
                                </div>
                                
                                <div className="mt-4">
                                    <small className="text-muted">
                                        You will be automatically redirected to login in a few seconds...
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
