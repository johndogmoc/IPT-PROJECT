import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

const Sidebar = () => {
    const [activeComponent, setActiveComponent] = useState('dashboard');
    const { authenticated, loading, checkAuthStatus } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const components = useMemo(() => ({
        dashboard: { name: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/dashboard' },
        faculty: { name: 'Faculty', icon: 'fas fa-chalkboard-teacher', path: '/faculty' },
        students: { name: 'Students', icon: 'fas fa-user-graduate', path: '/students' },
        reports: { name: 'Reports', icon: 'fas fa-chart-bar', path: '/reports' },
        settings: { name: 'Settings', icon: 'fas fa-cog', path: '/settings' },
        profile: { name: 'My Profile', icon: 'fas fa-user', path: '/profile' }
    }), []);

    useEffect(() => {
        if (!loading && !authenticated) {
            console.log('Redirecting to /login due to not authenticated');
            window.location.href = '/login';
        }
    }, [authenticated, loading, navigate]);

    useEffect(() => {
        const currentPath = location.pathname;
        const componentKey = Object.keys(components).find(key => 
            components[key].path === currentPath
        );
        if (componentKey) {
            setActiveComponent(componentKey);
        }
    }, [location.pathname]);

    const handleNavigation = (key) => {
        setActiveComponent(key);
        navigate(components[key].path);
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers
            });
            console.log('Logout successful');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
    };

    if (loading) {
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

    if (!authenticated && location.pathname !== '/login' && location.pathname !== '/unauthorized') {
        return null; // Let the router handle the redirect
    }

    return (
        <div className="layout">
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

            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Sidebar;