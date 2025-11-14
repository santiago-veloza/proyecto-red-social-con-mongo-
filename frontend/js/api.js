// Configuración de la API
const API_CONFIG = {
    // Detecta automáticamente si está en desarrollo o producción
    BASE_URL: (function() {
        const hostname = window.location.hostname;
        console.log('Hostname detected:', hostname);
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('Using localhost API');
            return 'http://localhost:5000/api';
        } else {
            console.log('Using production API:', `${window.location.origin}/api`);
            return `${window.location.origin}/api`;
        }
    })(),
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Cliente API
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.headers = API_CONFIG.HEADERS;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        console.log('Making request to:', url);
        
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            showLoading();
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // Métodos HTTP
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Instancia global del cliente API
const api = new APIClient();

// Endpoints específicos
const API_ENDPOINTS = {
    // Auth
    LOGIN: '/usuarios/login',
    REGISTER: '/usuarios',
    
    // Users
    USERS: '/usuarios',
    USER_BY_ID: (id) => `/usuarios/${id}`,
    
    // Posts
    POSTS: '/publicaciones',
    POST_BY_ID: (id) => `/publicaciones/${id}`,
    
    // Health
    HEALTH: '/health'
};

// Funciones de utilidad para la API
const ApiUtils = {
    // Verificar salud de la API
    async checkHealth() {
        try {
            const response = await api.get(API_ENDPOINTS.HEALTH);
            return response.status === 'OK';
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    },

    // Manejar errores de red
    handleNetworkError(error) {
        if (error.message.includes('fetch')) {
            showToast('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
        } else if (error.message.includes('timeout')) {
            showToast('La solicitud tardó demasiado. Inténtalo de nuevo.', 'error');
        } else {
            showToast(error.message || 'Error desconocido', 'error');
        }
    },

    // Validar respuesta de la API
    validateResponse(response) {
        if (!response) {
            throw new Error('Respuesta vacía del servidor');
        }
        
        if (response.success === false) {
            throw new Error(response.error || 'Error en la respuesta del servidor');
        }
        
        return response;
    }
};