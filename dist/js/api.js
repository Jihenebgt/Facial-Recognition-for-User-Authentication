/**
 * api.js - Communication with the API backend for the facial authentication system
 */

class ApiService {
    constructor() {
        // Base API URL - updated for production deployment
        this.baseUrl = 'http://localhost:8000/api';
        
        // Authentication token (for admin features)
        this.authToken = null;
    }
    
    /**
     * Makes a request to the API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {object} data - Data to send (for POST, PUT)
     * @param {boolean} requiresAuth - If the request requires authentication
     * @returns {Promise} - Promise with the response
     */
    async request(endpoint, method = 'GET', data = null, requiresAuth = false) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add authentication token if needed
        if (requiresAuth && this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        const options = {
            method,
            headers,
            mode: 'cors'
        };
        
        // Add request body for POST, PUT methods
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            // Check if response is OK (status 200-299)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    
    /**
     * Checks the API status
     * @returns {Promise} - Promise with the API status
     */
    async checkHealth() {
        return this.request('/health');
    }
    
    /**
     * Detects faces in an image
     * @param {string} imageData - Base64 image
     * @returns {Promise} - Promise with detection results
     */
    async detectFace(imageData) {
        return this.request('/detect', 'POST', { image: imageData });
    }
    
    /**
     * Recognizes a face in an image
     * @param {string} imageData - Base64 image
     * @returns {Promise} - Promise with recognition results
     */
    async recognizeFace(imageData) {
        return this.request('/recognize', 'POST', { image: imageData });
    }
    
    /**
     * Adds a new user
     * @param {string} name - User name
     * @param {number} age - User age
     * @param {string} profession - User profession
     * @param {string} imageData - Base64 image
     * @returns {Promise} - Promise with add results
     */
    async addUser(name, age, profession, imageData) {
        return this.request('/users', 'POST', {
            name,
            age,
            profession,
            image: imageData
        });
    }
    
    /**
     * Gets the list of users (admin)
     * @returns {Promise} - Promise with the user list
     */
    async getUsers() {
        return this.request('/users', 'GET', null, true);
    }
    
    /**
     * Deletes a user (admin)
     * @param {string} userId - ID of the user to delete
     * @returns {Promise} - Promise with deletion results
     */
    async deleteUser(userId) {
        return this.request(`/users/${userId}`, 'DELETE', null, true);
    }
    
    /**
     * Gets access logs (admin)
     * @param {number} limit - Maximum number of entries to retrieve
     * @returns {Promise} - Promise with logs
     */
    async getLogs(limit = 100) {
        return this.request(`/logs?limit=${limit}`, 'GET', null, true);
    }
}

// Create an API service instance
const apiService = new ApiService();

// Export for use in other scripts
window.apiService = apiService;
