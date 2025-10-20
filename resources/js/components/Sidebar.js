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
        archive: { name: 'Archive', icon: 'fas fa-archive', path: '/archive' },
        settings: { name: 'Settings', icon: 'fas fa-cog', path: '/settings' }
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
        <div className="modern-layout">
            <div className="modern-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <img 
                            src="/images/logo.png" 
                            alt="Starlink University"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <i className="fas fa-graduation-cap" style={{display: 'none'}}></i>
                    </div>
                    <h5 className="logo-text">Starlink University</h5>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-header">
                            <span>Home</span>
                            <i className="fas fa-chevron-up"></i>
                        </div>
                        
                        {Object.entries(components).map(([key, { name, icon }]) => (
                            <button
                                key={key}
                                className={`nav-item ${activeComponent === key ? 'active' : ''}`}
                                onClick={() => handleNavigation(key)}
                            >
                                <i className={`nav-icon ${icon}`}></i>
                                <span className="nav-text">{name}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button 
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Sidebar;