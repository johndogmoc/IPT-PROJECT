// API Utility Functions
export const API_BASE = '/api';

// Function to get CSRF token
const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('auth_token');
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken()
        }
    };
    
    // Add Authorization header if token exists
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

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
        
        // Handle authentication errors
        if (response.status === 401) {
            window.location.href = '/login';
            return { success: false, message: 'Authentication required' };
        }

        return data;
    } catch (error) {
        return { success: false, message: 'Network error: ' + error.message };
    }
};

// Helper function to check authentication status
export const checkAuth = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        // Add Authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE}/auth/check`, {
            method: 'GET',
            credentials: 'include',
            headers,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.log('Auth check response not ok:', response.status);
            return { success: true, authenticated: false };
        }

        const data = await response.json();
        console.log('Auth check successful:', data);
        return data;
    } catch (error) {
        console.error('Auth check error:', error);
        return { success: true, authenticated: false };
    }
};

// Helper function to logout
export const logout = async () => {
    try {
        const token = localStorage.getItem('auth_token');
        const headers = {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        };
        
        // Add Authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers
        });
    } catch (error) {
        // Silent fail
    } finally {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
    }
};

// Helper function to clear auth cache
export const clearAuthCache = () => {
    localStorage.removeItem('auth_token');
    // Clear auth cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};