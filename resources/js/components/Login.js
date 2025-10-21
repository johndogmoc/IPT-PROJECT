import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall, clearAuthCache } from '../utils/api';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { authenticated, loading, login } = useAuth();

    useEffect(() => {
        // Redirect to dashboard if already logged in
        if (!loading && authenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [authenticated, loading, navigate]);

    useEffect(() => {
        // Clear any existing auth data when login page loads
        clearAuthCache();
        console.log('Login page loaded, auth cache cleared');
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Use a direct fetch for login since we don't have a token yet
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(credentials),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && data.token) {
                // Set cookie for server-side authentication check
                document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
                
                // Use the login function from AuthContext
                login(data.token, data.user);
                
                // Navigate to dashboard
                navigate('/dashboard', { replace: true });
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px'}}>
                            <img 
                                src="/images/logo.png"
                                alt="Starlink University Logo" 
                                style={{width: '60px', height: '60px', objectFit: 'contain'}}
                            />
                            <h1 style={{margin: '0'}}>Starlink University</h1>
                        </div>
                        <p className="login-subtitle">Admin Dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="alert alert-danger">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-user"></i>
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary btn-login w-100"
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;