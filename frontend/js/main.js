// Archivo principal - Inicialización y configuración global
class App {
    constructor() {
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // Inicializar la aplicación
    async init() {
        try {
            console.log('🚀 Inicializando UCC - Universidad Cooperativa de Colombia...');
            
            // Verificar que la API esté disponible
            await this.checkAPIConnection();
            
            // Inicializar componentes
            this.initializeComponents();
            this.setupEventListeners();
            
            // Verificar autenticación
            authManager.init();
            
            // Si está autenticado, cargar datos del dashboard
            if (authManager.isAuthenticated()) {
                await this.loadDashboardData();
            }
            
            this.isInitialized = true;
            console.log('✅ UCC inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
            this.handleInitializationError(error);
        }
    }

    // Verificar conexión con la API
    async checkAPIConnection() {
        const isHealthy = await ApiUtils.checkHealth();
        
        if (!isHealthy) {
            const isProduction = !window.location.hostname.includes('localhost');
            const errorMessage = isProduction 
                ? 'No se puede conectar con el servidor. Por favor, inténtalo más tarde.'
                : 'No se puede conectar con el servidor. Verifica que esté ejecutándose en http://localhost:5000';
            
            throw new Error(errorMessage);
        }
        
        console.log('✅ Conexión con API establecida');
    }

    // Inicializar componentes
    initializeComponents() {
        // Configurar navegación móvil
        this.setupMobileNavigation();
        
        // Configurar auto-resize de textareas
        this.setupTextareaAutoResize();
        
        console.log('✅ Componentes inicializados');
    }

    // Configurar navegación móvil
    setupMobileNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
            
            // Cerrar menú al hacer click en un enlace
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    // Configurar auto-resize de textareas
    setupTextareaAutoResize() {
        const textarea = document.getElementById('post-content');
        if (textarea) {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }
    }

    // Configurar event listeners globales
    setupEventListeners() {
        // Manejar errores globales
        window.addEventListener('error', (event) => {
            console.error('Error global:', event.error);
            showToast('Ha ocurrido un error inesperado', 'error');
        });

        // Manejar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesa rechazada:', event.reason);
            showToast('Error de conexión', 'error');
        });

        // Manejar cambios de conectividad
        window.addEventListener('online', () => {
            showToast('Conexión restablecida', 'success');
            if (authManager.isAuthenticated()) {
                this.loadDashboardData();
            }
        });

        window.addEventListener('offline', () => {
            showToast('Sin conexión a internet', 'warning');
        });

        // Manejar cambios de tamaño de ventana
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleWindowResize();
        }, 250));

        console.log('✅ Event listeners configurados');
    }

    // Manejar cambios de tamaño de ventana
    handleWindowResize() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        if (window.innerWidth > 768) {
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
        }
    }

    // Cargar datos del dashboard
    async loadDashboardData() {
        try {
            console.log('📊 Cargando datos del dashboard...');
            
            // Cargar en paralelo para mejor rendimiento
            const promises = [
                postsManager.loadPosts(),
                usersManager.loadUsers()
            ];
            
            await Promise.allSettled(promises);
            
            console.log('✅ Datos del dashboard cargados');
            
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            showToast('Error cargando algunos datos', 'warning');
        }
    }

    // Manejar errores de inicialización
    handleInitializationError(error) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Reintentando inicialización (${this.retryCount}/${this.maxRetries})...`);
            
            setTimeout(() => {
                this.init();
            }, 2000 * this.retryCount); // Incrementar delay con cada retry
        } else {
            // Mostrar error fatal
            this.showFatalError(error.message);
        }
    }

    // Mostrar error fatal
    showFatalError(message) {
        const errorHtml = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--background-color);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 2rem;
            ">
                <div style="
                    background: var(--card-background);
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: var(--shadow-lg);
                    text-align: center;
                    max-width: 500px;
                ">
                    <i class="fas fa-exclamation-triangle" style="
                        font-size: 4rem;
                        color: var(--error-color);
                        margin-bottom: 1rem;
                    "></i>
                    <h2 style="margin-bottom: 1rem; color: var(--text-primary);">
                        Error de Conexión
                    </h2>
                    <p style="margin-bottom: 2rem; color: var(--text-secondary);">
                        ${message}
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            <i class="fas fa-refresh"></i>
                            Reintentar
                        </button>
                        <button onclick="app.showHelp()" class="btn" style="background-color: var(--secondary-color); color: white;">
                            <i class="fas fa-question-circle"></i>
                            Ayuda
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHtml);
    }

    // Mostrar ayuda
    showHelp() {
        const isProduction = !window.location.hostname.includes('localhost');
        
        const helpMessage = isProduction 
            ? `Para solucionar este problema:
            
            1. Verifica tu conexión a internet
            2. El servidor está siendo configurado, inténtalo en unos minutos
            3. Contacta al administrador si el problema persiste
            
            URL de la API: ${API_CONFIG.BASE_URL}`
            : `Para solucionar este problema:
            
            1. Verifica que el servidor esté ejecutándose:
               python app.py
            
            2. Confirma que esté en el puerto 5000:
               http://localhost:5000
            
            3. Verifica tu conexión a internet
            
            4. Refresca la página`;
        
        alert(helpMessage);
    }

    // Debug de la API (útil para desarrollo)
    debugAPI() {
        console.log('=== APP DEBUG INFO ===');
        console.log('App initialized:', this.isInitialized);
        console.log('Retry count:', this.retryCount);
        
        if (typeof ApiUtils !== 'undefined') {
            ApiUtils.debugApiConfig();
        }
        
        console.log('======================');
    }

    // Recargar datos
    async refresh() {
        if (!authManager.isAuthenticated()) return;
        
        try {
            showLoading();
            await this.loadDashboardData();
            showToast('Datos actualizados', 'success');
        } catch (error) {
            console.error('Error refrescando datos:', error);
            showToast('Error al actualizar datos', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Función global para cargar datos del dashboard
async function loadDashboardData() {
    if (window.app) {
        await window.app.loadDashboardData();
    }
}

// Función de utilidad para el manejo de navegación
function navigateTo(section) {
    // Actualizar enlaces de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[href="#${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Ocultar todas las secciones
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('profile-section').classList.add('hidden');
    document.getElementById('auth-section').classList.add('hidden');
    
    // Mostrar la sección correspondiente
    switch(section) {
        case 'home':
            document.getElementById('dashboard-section').classList.remove('hidden');
            // Recargar posts si es necesario
            if (postsManager && authManager.isAuthenticated()) {
                postsManager.loadPosts();
            }
            break;
        case 'profile':
            if (authManager && authManager.isAuthenticated()) {
                // Verificar que profileManager esté disponible
                if (typeof profileManager !== 'undefined') {
                    profileManager.showProfile();
                } else {
                    showToast('Error: Gestor de perfiles no disponible', 'error');
                }
            } else {
                showToast('Debes estar logueado para ver tu perfil', 'warning');
                // Mostrar formulario de login en su lugar
                document.getElementById('auth-section').classList.remove('hidden');
            }
            break;
        case 'friends':
            showToast('Sección "Amigos" próximamente', 'info');
            break;
        default:
            document.getElementById('dashboard-section').classList.remove('hidden');
    }
}

// Configurar navegación por hash
function setupHashNavigation() {
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1); // Remover #
        if (hash) {
            navigateTo(hash);
        }
    });
    
    // Manejar hash inicial
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
        // Esperar a que la app se inicialice
        setTimeout(() => {
            navigateTo(initialHash);
        }, 100);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 DOM cargado, iniciando aplicación...');
    
    // Crear instancia global de la aplicación
    window.app = new App();
    
    // Configurar navegación por hash
    setupHashNavigation();
    
    // Inicializar aplicación
    await window.app.init();
});

// Exportar funciones globales para uso en HTML
window.login = login;
window.register = register;
window.logout = logout;
window.switchTab = switchTab;
window.createPost = createPost;
window.likePost = likePost;
window.sharePost = sharePost;
window.reportPost = reportPost;
window.navigateTo = navigateTo;
window.toggleFeedType = toggleFeedType;
window.toggleSortType = toggleSortType;
window.showProfile = showProfile;
window.debugProfile = debugProfile;

// Funciones de debug globales
window.debugAPI = () => {
    if (window.app) {
        window.app.debugAPI();
    }
    if (typeof ApiUtils !== 'undefined') {
        ApiUtils.debugApiConfig();
    }
};