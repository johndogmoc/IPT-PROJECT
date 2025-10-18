// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const response = await apiCall('/auth/check');
            if (response.success && response.authenticated) {
                setUser(response.user);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Only expose necessary user data
    const getAuthData = () => {
        if (!user) return null;
        return {
            id: user.id,
            role: user.role
        };
    };

    const value = {
        user: getAuthData(),
        loading,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
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