import axios from 'axios';

axios.defaults.withCredentials = true; // Permite el envío de cookies de sesión

const api = axios.create({    
    baseURL: 'http://musisense.test/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

/**
 * Request Interceptor
 * Automatically attaches the Bearer Token to every request 
 * if the user is logged in.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles common errors globally (like 401 Unauthorized)
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the server returns 401 (Unauthorized), the token might be expired
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized request. Redirecting to login...");
            localStorage.removeItem('token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;