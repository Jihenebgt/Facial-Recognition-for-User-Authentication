/**
 * api.js - Communication with the API backend for the facial recognition system
 */

class ApiService {
    constructor() {
        // Base URL of the API
        this.baseUrl = 'http://localhost:5000/api';
        
        // Authentification Token (admin functionalitis)
        this.authToken = null;
    }
    
    /**
     * Effectue une requête vers l'API
     * @param {string} endpoint - Point of terminaison of the API
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {object} data - Data to forward (pour POST, PUT)
     * @param {boolean} requiresAuth - If the request needs authentification
     * @returns {Promise} - Response 
     */
    async request(endpoint, method = 'GET', data = null, requiresAuth = false) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add the authentification token if necessary 
        if (requiresAuth && this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        const options = {
            method,
            headers,
            mode: 'cors'
        };
        
        // Add the body of the POST, PUT requests 
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            // Verify if the resonse si OK (status 200-299)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Erreur API (${endpoint}):`, error);
            throw error;
        }
    }
    
    /**
     * Verify the API state 
     * @returns {Promise} - Promise with the API state 
     */
    async checkHealth() {
        return this.request('/health');
    }
    
    /**
     * Detect the faces in the image 
     * @param {string} imageData - Base64 image
     * @returns {Promise} - Promise with the details of detection 
     */
    async detectFace(imageData) {
        return this.request('/detect', 'POST', { image: imageData });
    }
    
    /**
     * recognise a face in the image 
     * @param {string} imageData - Base64 image
     * @returns {Promise} - Promise with the details of recognition  
     */
    async recognizeFace(imageData) {
        return this.request('/recognize', 'POST', { image: imageData });
    }
    
    /**
     * Add a new user 
     * @param {string} name - user name 
     * @param {number} age - user age 
     * @param {string} profession - user profession 
     * @param {string} imageData - Base64 image 
     * @returns {Promise} - Promise with the details of addition 
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
     * Retrieve the list of users (admin)
     * @returns {Promise} - Promise with the list of users 
     */
    async getUsers() {
        return this.request('/users', 'GET', null, true);
    }
    
    /**
     * Delete a user (admin)
     * @param {string} userId - User ID to delete 
     * @returns {Promise} - Promise with the results of the deletion 
     */
    async deleteUser(userId) {
        return this.request(`/users/${userId}`, 'DELETE', null, true);
    }
    
    /**
     * Retrieve the access logs 
     * @param {number} limit - Number of maximum retrieved accesses 
     * @returns {Promise} - Promise with the journals 
     */
    async getLogs(limit = 100) {
        return this.request(`/logs?limit=${limit}`, 'GET', null, true);
    }
}

// Create a new instance of the API service 
const apiService = new ApiService();

// Export for use in other service 
window.apiService = apiService;
