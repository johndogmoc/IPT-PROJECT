import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Simple function to check if user has a valid token
    const checkAuthStatus = async () => {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            setAuthenticated(false);
            setUser(null);
            setLoading(false);
            return { success: true, authenticated: false };
        }

        try {
            const response = await fetch('/api/auth/check', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.authenticated) {
                    setAuthenticated(true);
                    setUser(data.user || { authenticated: true });
                    setLoading(false);
                    return data;
                }
            }
            
            setAuthenticated(false);
            setUser(null);
            localStorage.removeItem('auth_token');
        } catch (error) {
            setAuthenticated(false);
            setUser(null);
            localStorage.removeItem('auth_token');
        }
        
        setLoading(false);
        return { success: true, authenticated: false };
    };

    // Login function
    const login = (token, userData = null) => {
        localStorage.setItem('auth_token', token);
        setAuthenticated(true);
        setUser(userData || { authenticated: true });
        setLoading(false);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('auth_token');
        setAuthenticated(false);
        setUser(null);
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const value = {
        authenticated,
        loading,
        user,
        checkAuthStatus,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Alias for backward compatibility
export const useUser = useAuth;