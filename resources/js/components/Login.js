import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include', // Include cookies
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            console.log('Login response:', {
                status: response.status,
                data: data,
                cookies: document.cookie
            });

            if (data.success) {
                // Store user info in localStorage for frontend use
                localStorage.setItem('user', JSON.stringify(data.data));
                console.log('Login successful, redirecting to dashboard');
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed');
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
                        <div className="logo">
                            <i className="fas fa-graduation-cap"></i>
                            <h1>Starlink University</h1>
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
