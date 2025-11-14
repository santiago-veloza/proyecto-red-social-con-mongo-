// Configuración de la API
const API_CONFIG = {
    BASE_URL: (function() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const origin = window.location.origin;
        const port = window.location.port;
        
        console.log('=== API CONFIG DEBUG ===');
        console.log('Hostname:', hostname);
        console.log('Protocol:', protocol);
        console.log('Port:', port);
        console.log('Origin:', origin);
        
        let baseUrl;
        
        // Detectar entorno local (localhost o 127.0.0.1 con puerto específico)
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isLocalPort = port === '5000' || port === '3000' || !port;
        
        if (isLocalhost && protocol === 'http:' && isLocalPort) {
            baseUrl = 'http://localhost:5000/api';
            console.log('🏠 Development environment detected - using local API');
        } else {
            // Producción: usar la URL actual (Vercel, Netlify, etc.)
            baseUrl = `${origin}/api`;
            console.log('🌐 Production environment detected - using:', baseUrl);
        }
        
        console.log('Final API URL:', baseUrl);
        console.log('========================');
        
        return baseUrl;
    })(),
    TIMEOUT: 15000,
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
            console.log('Checking API health at:', API_CONFIG.BASE_URL + API_ENDPOINTS.HEALTH);
            const response = await api.get(API_ENDPOINTS.HEALTH);
            console.log('Health check response:', response);
            return response.status === 'OK';
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    },

    // Debug de la configuración de la API
    debugApiConfig() {
        console.log('=== API DEBUG INFO ===');
        console.log('Current URL:', window.location.href);
        console.log('API Base URL:', API_CONFIG.BASE_URL);
        console.log('Is Production:', !window.location.hostname.includes('localhost'));
        console.log('Available Endpoints:', API_ENDPOINTS);
        console.log('====================');
        
        // Intentar hacer un ping rápido
        this.checkHealth().then(isHealthy => {
            console.log('API Health Status:', isHealthy ? '✅ Healthy' : '❌ Failed');
        });
    },

    // Manejar errores de red
    handleNetworkError(error) {
        const isProduction = !window.location.hostname.includes('localhost');
        
        if (error.message.includes('fetch') || error.name === 'TypeError') {
            if (isProduction) {
                showToast('Error de conexión con el servidor. Por favor, inténtalo más tarde.', 'error');
            } else {
                showToast('Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:5000', 'error');
            }
        } else if (error.message.includes('timeout')) {
            showToast('La solicitud tardó demasiado. Inténtalo de nuevo.', 'error');
        } else if (error.message.includes('404')) {
            showToast('Endpoint no encontrado. Verifica la configuración de la API.', 'error');
        } else {
            showToast(error.message || 'Error desconocido', 'error');
        }
        
        // Log detallado para debugging
        console.error('Network Error Details:', {
            message: error.message,
            stack: error.stack,
            apiUrl: API_CONFIG.BASE_URL,
            isProduction: isProduction
        });
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