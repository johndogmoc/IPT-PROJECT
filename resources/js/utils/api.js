// API Utility Functions
export const API_BASE = '/api';

// State to track authentication
let isAuthenticated = false;

// Function to get CSRF token
const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken()
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, mergedOptions);
        
        if (!response.ok) {
            if (response.status === 401) {
                isAuthenticated = false;
                window.location.href = '/login';
                throw new Error('Authentication required');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check for HTML response (which might indicate an error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('Received HTML response instead of JSON');
        }

        const data = await response.json();
        
        // Only log minimal response info in development
        if (process.env.NODE_ENV === 'development') {
            const safeLog = {
                status: response.status,
                success: data.success,
                message: data.message
            };
            console.log(`API ${endpoint}:`, safeLog);
        }

        // Handle authentication errors
        if (response.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
            return { success: false, message: 'Authentication required' };
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        return { success: false, message: 'Network error: ' + error.message };
    }
};

// Helper function to check authentication status
export const checkAuth = async () => {
    try {
        const response = await fetch(`${API_BASE}/auth/check`, {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Auth check failed:', error);
        return { success: false, authenticated: false };
    }
};

// Helper function to logout
export const logout = async () => {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};
