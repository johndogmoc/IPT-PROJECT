import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const [activeComponent, setActiveComponent] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const components = {
        dashboard: { name: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/dashboard' },
        faculty: { name: 'Faculty', icon: 'fas fa-chalkboard-teacher', path: '/faculty' },
        students: { name: 'Students', icon: 'fas fa-user-graduate', path: '/students' },
        reports: { name: 'Reports', icon: 'fas fa-chart-bar', path: '/reports' },
        settings: { name: 'Settings', icon: 'fas fa-cog', path: '/settings' },
        profile: { name: 'My Profile', icon: 'fas fa-user', path: '/profile' }
    };

    useEffect(() => {
        // Check authentication status
        const checkAuth = async () => {
            setAuthLoading(true);
            try {
                const response = await fetch('/api/auth/check', {
                    method: 'GET',
                    credentials: 'include' // Include cookies
                });

                const data = await response.json();

                console.log('Auth check response:', {
                    status: response.status,
                    data: data,
                    cookies: document.cookie
                });

                if (!data.success || !data.authenticated) {
                    console.log('Authentication failed:', data);
                    setIsAuthenticated(false);
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }

                console.log('Authentication successful:', data);
                setIsAuthenticated(true);
                // Update localStorage with current user data
                if (data.data) {
                    localStorage.setItem('user', JSON.stringify(data.data));
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setIsAuthenticated(false);
                localStorage.removeItem('user');
                navigate('/login');
            } finally {
                setAuthLoading(false);
            }
        };

        checkAuth();

        // Set active component based on current path
        const currentPath = location.pathname;
        const componentKey = Object.keys(components).find(key => 
            components[key].path === currentPath
        );
        
        if (componentKey) {
            setActiveComponent(componentKey);
        } else {
            setActiveComponent('dashboard');
        }
    }, [location.pathname, navigate]);

    const handleNavigation = (componentKey) => {
        const component = components[componentKey];
        if (component) {
            setActiveComponent(componentKey);
            navigate(component.path);
        }
    };

    const handleLogout = async () => {
        try {
            // Call logout API to clear cookies
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });
        } catch (err) {
            console.error('Logout API call failed:', err);
        } finally {
            // Clear localStorage regardless of API call result
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="layout">
                <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                        <p>Checking authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Starlink University
                </div>
                
                <nav className="nav flex-column">
                    {Object.entries(components).map(([key, { name, icon }]) => (
                        <div key={key} className="nav-item">
                            <button
                                className={`nav-link ${activeComponent === key ? 'active' : ''}`}
                                onClick={() => handleNavigation(key)}
                            >
                                <i className={icon}></i>
                                {name}
                            </button>
                        </div>
                    ))}
                    
                    {/* Logout Button */}
                    <div className="nav-item mt-3">
                        <button
                            className="nav-link logout-btn"
                            onClick={handleLogout}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Sidebar;
