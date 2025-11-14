// Gestión de autenticación
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.TOKEN_KEY = 'unisocial_user';
    }

    // Inicializar autenticación
    init() {
        this.loadUserFromStorage();
        this.updateUI();
    }

    // Cargar usuario desde localStorage
    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem(this.TOKEN_KEY);
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }

    // Guardar usuario en localStorage
    saveUserToStorage(user) {
        try {
            localStorage.setItem(this.TOKEN_KEY, JSON.stringify(user));
            this.currentUser = user;
        } catch (error) {
            console.error('Error saving user to storage:', error);
            throw new Error('Error al guardar la sesión');
        }
    }

    // Eliminar usuario del localStorage
    removeUserFromStorage() {
        localStorage.removeItem(this.TOKEN_KEY);
        this.currentUser = null;
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Login
    async login(email, password) {
        try {
            const response = await api.post(API_ENDPOINTS.LOGIN, {
                email: email,
                contraseña: password
            });

            ApiUtils.validateResponse(response);

            if (response.success && response.usuario) {
                this.saveUserToStorage(response.usuario);
                showToast('¡Bienvenido de vuelta!', 'success');
                this.updateUI();
                return true;
            } else {
                throw new Error('Credenciales inválidas');
            }
        } catch (error) {
            console.error('Login error:', error);
            ApiUtils.handleNetworkError(error);
            return false;
        }
    }

    // Registro
    async register(userData) {
        try {
            const response = await api.post(API_ENDPOINTS.REGISTER, {
                nombre: userData.name,
                email: userData.email,
                contraseña: userData.password,
                universidad: userData.university,
                carrera: userData.career,
                intereses: userData.interests || []
            });

            ApiUtils.validateResponse(response);

            if (response.success) {
                // Mostrar mensaje personalizado basado en intereses
                const interestNames = {
                    'general': 'General',
                    'academico': 'Académico', 
                    'eventos': 'Eventos',
                    'ayuda': 'Ayuda',
                    'social': 'Social'
                };
                
                const interestsList = userData.interests.map(i => interestNames[i]).join(', ');
                showToast(
                    `¡Cuenta creada exitosamente! Te mostraremos contenido sobre: ${interestsList}`, 
                    'success'
                );
                
                // Cambiar automáticamente a la pestaña de login
                switchTab('login');
                return true;
            } else {
                throw new Error(response.error || 'Error al crear la cuenta');
            }
        } catch (error) {
            console.error('Register error:', error);
            ApiUtils.handleNetworkError(error);
            return false;
        }
    }

    // Logout
    logout() {
        this.removeUserFromStorage();
        showToast('Sesión cerrada correctamente', 'success');
        this.updateUI();
    }

    // Actualizar interfaz según estado de autenticación
    updateUI() {
        const authSection = document.getElementById('auth-section');
        const dashboardSection = document.getElementById('dashboard-section');
        const header = document.querySelector('.header');

        if (this.isAuthenticated()) {
            authSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            header.style.display = 'block';
            this.updateUserInfo();
            // Cargar datos del dashboard
            loadDashboardData();
        } else {
            authSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
            header.style.display = 'none';
        }
    }

    // Actualizar información del usuario en la UI
    updateUserInfo() {
        if (!this.currentUser) return;

        const elements = {
            'user-name': this.currentUser.nombre,
            'profile-name': this.currentUser.nombre,
            'profile-career': this.currentUser.carrera || 'Carrera no especificada',
            'profile-university': this.currentUser.universidad || 'Universidad no especificada'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Mostrar intereses del usuario
        this.displayUserInterests();
    }

    // Mostrar intereses del usuario
    displayUserInterests() {
        const interestsContainer = document.getElementById('profile-interests-list');
        if (!interestsContainer || !this.currentUser.intereses) return;

        const interestNames = {
            'general': '📝 General',
            'academico': '📚 Académico', 
            'eventos': '🎉 Eventos',
            'ayuda': '🆘 Ayuda',
            'social': '👥 Social'
        };

        const interestTags = this.currentUser.intereses.map(interest => 
            `<span class="interest-tag">${interestNames[interest] || interest}</span>`
        ).join('');

        interestsContainer.innerHTML = interestTags || '<span style="color: var(--text-secondary); font-size: 0.8rem;">No hay intereses seleccionados</span>';
    }
}

// Instancia global del gestor de autenticación
const authManager = new AuthManager();

// Funciones globales para los formularios
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Por favor, completa todos los campos', 'warning');
        return;
    }

    const success = await authManager.login(email, password);
    if (success) {
        // Limpiar formulario
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
    }
}

async function register(event) {
    event.preventDefault();
    
    // Obtener intereses seleccionados
    const selectedInterests = [];
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
    interestCheckboxes.forEach(checkbox => {
        selectedInterests.push(checkbox.value);
    });

    const formData = {
        name: document.getElementById('register-name').value.trim(),
        email: document.getElementById('register-email').value.trim(),
        password: document.getElementById('register-password').value,
        university: 'Universidad Cooperativa de Colombia', // Fijo para UCC
        career: document.getElementById('register-career').value.trim(),
        interests: selectedInterests
    };

    // Validaciones básicas
    if (!formData.name || !formData.email || !formData.password) {
        showToast('Por favor, completa los campos obligatorios', 'warning');
        return;
    }

    if (formData.password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showToast('Por favor, ingresa un email válido', 'warning');
        return;
    }

    // Validar que sea un email de la UCC
    if (!formData.email.toLowerCase().includes('ucc.edu.co')) {
        showToast('Debes usar tu email institucional de la UCC (@ucc.edu.co)', 'warning');
        return;
    }

    if (selectedInterests.length === 0) {
        showToast('Por favor, selecciona al menos un interés', 'warning');
        return;
    }

    const success = await authManager.register(formData);
    if (success) {
        // Limpiar formulario (excepto universidad que es fija)
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        // Universidad se mantiene fija en "Universidad Cooperativa de Colombia"
        document.getElementById('register-career').value = '';
        
        // Desmarcar todos los checkboxes
        document.querySelectorAll('input[name="interests"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

function logout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        authManager.logout();
    }
}

// Alternar entre pestañas de login y registro
function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // Remover clase active de todos los botones
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Ocultar todos los formularios
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');

    if (tab === 'login') {
        loginForm.classList.add('active');
        tabButtons[0].classList.add('active');
    } else if (tab === 'register') {
        registerForm.classList.add('active');
        tabButtons[1].classList.add('active');
    }
}