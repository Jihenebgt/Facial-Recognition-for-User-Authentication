/**
 * api.js - Communication avec l'API backend pour le système d'authentification faciale
 */

class ApiService {
    constructor() {
        // URL de base de l'API
        this.baseUrl = 'http://localhost:5000/api';
        
        // Token d'authentification (pour les fonctionnalités admin)
        this.authToken = null;
    }
    
    /**
     * Effectue une requête vers l'API
     * @param {string} endpoint - Point de terminaison de l'API
     * @param {string} method - Méthode HTTP (GET, POST, etc.)
     * @param {object} data - Données à envoyer (pour POST, PUT)
     * @param {boolean} requiresAuth - Si la requête nécessite une authentification
     * @returns {Promise} - Promesse avec la réponse
     */
    async request(endpoint, method = 'GET', data = null, requiresAuth = false) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Ajouter le token d'authentification si nécessaire
        if (requiresAuth && this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        const options = {
            method,
            headers,
            mode: 'cors'
        };
        
        // Ajouter le corps de la requête pour les méthodes POST, PUT
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            // Vérifier si la réponse est OK (status 200-299)
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
     * Vérifie l'état de l'API
     * @returns {Promise} - Promesse avec l'état de l'API
     */
    async checkHealth() {
        return this.request('/health');
    }
    
    /**
     * Détecte les visages dans une image
     * @param {string} imageData - Image en base64
     * @returns {Promise} - Promesse avec les résultats de détection
     */
    async detectFace(imageData) {
        return this.request('/detect', 'POST', { image: imageData });
    }
    
    /**
     * Reconnaît un visage dans une image
     * @param {string} imageData - Image en base64
     * @returns {Promise} - Promesse avec les résultats de reconnaissance
     */
    async recognizeFace(imageData) {
        return this.request('/recognize', 'POST', { image: imageData });
    }
    
    /**
     * Ajoute un nouvel utilisateur
     * @param {string} name - Nom de l'utilisateur
     * @param {number} age - Âge de l'utilisateur
     * @param {string} profession - Profession de l'utilisateur
     * @param {string} imageData - Image en base64
     * @returns {Promise} - Promesse avec les résultats de l'ajout
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
     * Récupère la liste des utilisateurs (admin)
     * @returns {Promise} - Promesse avec la liste des utilisateurs
     */
    async getUsers() {
        return this.request('/users', 'GET', null, true);
    }
    
    /**
     * Supprime un utilisateur (admin)
     * @param {string} userId - ID de l'utilisateur à supprimer
     * @returns {Promise} - Promesse avec les résultats de la suppression
     */
    async deleteUser(userId) {
        return this.request(`/users/${userId}`, 'DELETE', null, true);
    }
    
    /**
     * Récupère les journaux d'accès (admin)
     * @param {number} limit - Nombre maximum d'entrées à récupérer
     * @returns {Promise} - Promesse avec les journaux
     */
    async getLogs(limit = 100) {
        return this.request(`/logs?limit=${limit}`, 'GET', null, true);
    }
}

// Créer une instance du service API
const apiService = new ApiService();

// Exporter pour utilisation dans d'autres scripts
window.apiService = apiService;
