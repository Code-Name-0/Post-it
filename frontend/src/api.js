// API configuration for frontend
// When frontend and backend are deployed separately, point to the backend URL

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
        credentials: 'include',
        ...options,
    });
};
