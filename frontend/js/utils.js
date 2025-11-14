// Utilidades generales
class Utils {
    // Mostrar/ocultar spinner de carga
    static showLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.remove('hidden');
        }
    }

    static hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }

    // Sistema de notificaciones toast
    static showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 1rem;">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    static getToastIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // Formatear fecha
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options })
            .format(new Date(date));
    }

    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Escapar HTML
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Truncar texto
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Generar ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Formatear números
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Copiar al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    }

    // Detectar si es móvil
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Scroll suave
    static smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Funciones globales para compatibilidad
function showLoading() {
    Utils.showLoading();
}

function hideLoading() {
    Utils.hideLoading();
}

function showToast(message, type = 'info', duration = 5000) {
    Utils.showToast(message, type, duration);
}

// Gestión de usuarios
class UsersManager {
    constructor() {
        this.users = [];
        this.onlineUsers = [];
    }

    async loadUsers() {
        try {
            const response = await api.get(API_ENDPOINTS.USERS);
            ApiUtils.validateResponse(response);
            
            this.users = response.usuarios || [];
            this.updateUsersCount();
            this.renderOnlineUsers();
            
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    updateUsersCount() {
        const totalUsersElement = document.getElementById('total-users');
        const friendsCountElement = document.getElementById('friends-count');
        
        if (totalUsersElement) {
            totalUsersElement.textContent = this.users.length;
        }
        
        if (friendsCountElement) {
            // Por ahora, mostrar usuarios total - 1 (excluyendo al usuario actual)
            friendsCountElement.textContent = Math.max(0, this.users.length - 1);
        }
    }

    renderOnlineUsers() {
        const container = document.getElementById('online-users-list');
        if (!container) return;

        // Simular usuarios en línea (excluyendo al usuario actual)
        const currentUser = authManager.getCurrentUser();
        const otherUsers = this.users.filter(user => user._id !== currentUser?._id);
        
        // Tomar los primeros 5 usuarios como "en línea"
        const onlineUsers = otherUsers.slice(0, 5);

        if (onlineUsers.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No hay usuarios en línea</p>';
            return;
        }

        container.innerHTML = onlineUsers.map(user => `
            <div class="online-user">
                <div class="online-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="online-info">
                    <div style="font-weight: 500;">${user.nombre}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${user.carrera || 'Estudiante'}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Instancia global del gestor de usuarios
const usersManager = new UsersManager();

// Agregar estilos CSS dinámicamente para animaciones
const additionalStyles = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);
    }

    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .online-info {
        flex: 1;
    }

    .post-action:hover {
        transform: translateY(-1px);
    }

    .nav-menu.active {
        left: 0;
    }

    @media (max-width: 768px) {
        .nav-toggle.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active .bar:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .nav-toggle.active .bar:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;

// Inyectar estilos adicionales
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);