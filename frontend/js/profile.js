// Gestión de perfiles de usuario
class ProfileManager {
    constructor() {
        this.currentProfile = null;
        this.isLoading = false;
    }

    // Cargar perfil completo del usuario
    async loadUserProfile(userId = null) {
        console.log('🔍 loadUserProfile iniciado, userId:', userId);
        
        if (this.isLoading) {
            console.log('⚠️ Ya está cargando el perfil');
            return;
        }

        try {
            this.isLoading = true;
            
            // Verificar que authManager existe
            if (typeof authManager === 'undefined') {
                throw new Error('AuthManager no está disponible');
            }
            
            // Si no se proporciona userId, usar el usuario actual
            const currentUser = authManager.getCurrentUser();
            console.log('👤 Usuario actual:', currentUser);
            
            if (!userId && currentUser) {
                userId = currentUser._id;
            }

            if (!userId) {
                throw new Error('No se puede cargar el perfil sin ID de usuario');
            }

            console.log('📡 Cargando perfil para usuario:', userId);
            showLoading();
            
            const response = await api.get(`${API_ENDPOINTS.USERS}/${userId}/perfil`);
            ApiUtils.validateResponse(response);

            if (response.success && response.perfil) {
                this.currentProfile = response.perfil;
                this.renderProfile();
                showToast('Perfil cargado exitosamente', 'success');
            } else {
                throw new Error('No se pudo cargar el perfil');
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            showToast('Error al cargar el perfil: ' + (error.message || 'Error de conexión'), 'error');
        } finally {
            this.isLoading = false;
            hideLoading();
        }
    }

    // Renderizar perfil en la interfaz
    renderProfile() {
        if (!this.currentProfile) return;

        const { usuario, estadisticas, publicaciones_recientes } = this.currentProfile;

        // Información básica del usuario
        this.updateElement('profile-user-name', usuario.nombre);
        this.updateElement('profile-user-career', 
            `${usuario.carrera || 'Sin carrera'} • ${usuario.universidad || 'Sin universidad'}`);
        
        // Fecha de registro
        if (usuario.fecha_registro) {
            const fechaRegistro = new Date(usuario.fecha_registro);
            this.updateElement('profile-user-joined', 
                `Miembro desde ${fechaRegistro.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long' 
                })}`);
        }

        // Estadísticas
        this.updateElement('profile-posts-count', estadisticas.total_publicaciones);
        this.updateElement('profile-likes-count', estadisticas.total_likes_recibidos);
        this.updateElement('profile-category-count', Object.keys(estadisticas.categorias_uso).length);

        // Intereses
        this.renderInterests(usuario.intereses);

        // Categoría favorita
        this.renderFavoriteCategory(estadisticas.categoria_favorita, estadisticas.categorias_uso);

        // Publicaciones recientes
        this.renderRecentPosts(publicaciones_recientes);
    }

    // Renderizar intereses del usuario
    renderInterests(interests) {
        const container = document.getElementById('profile-interests-badges');
        if (!container) return;

        if (!interests || interests.length === 0) {
            container.innerHTML = '<p class="no-interests">No hay intereses definidos</p>';
            return;
        }

        const interestNames = {
            'general': '📝 General',
            'academico': '📚 Académico',
            'eventos': '🎉 Eventos',
            'ayuda': '🆘 Ayuda',
            'social': '👥 Social'
        };

        const interestColors = {
            'general': '#3b82f6',
            'academico': '#10b981',
            'eventos': '#f59e0b',
            'ayuda': '#ef4444',
            'social': '#8b5cf6'
        };

        container.innerHTML = interests.map(interest => 
            `<span class="interest-badge" style="background-color: ${interestColors[interest] || '#6b7280'};">
                ${interestNames[interest] || interest}
            </span>`
        ).join('');
    }

    // Renderizar categoría favorita
    renderFavoriteCategory(categoria, categoriasUso) {
        const container = document.getElementById('profile-favorite-category-badge');
        if (!container) return;

        if (!categoria || !categoriasUso[categoria]) {
            container.innerHTML = '<p class="no-category">Sin actividad suficiente</p>';
            return;
        }

        const categoryNames = {
            'general': '📝 General',
            'academico': '📚 Académico',
            'eventos': '🎉 Eventos',
            'ayuda': '🆘 Ayuda',
            'social': '👥 Social'
        };

        const categoryColors = {
            'general': '#3b82f6',
            'academico': '#10b981',
            'eventos': '#f59e0b',
            'ayuda': '#ef4444',
            'social': '#8b5cf6'
        };

        const count = categoriasUso[categoria];
        container.innerHTML = `
            <div class="favorite-category" style="border-color: ${categoryColors[categoria] || '#6b7280'};">
                <span class="category-icon" style="background-color: ${categoryColors[categoria] || '#6b7280'};">
                    ${categoryNames[categoria] || categoria}
                </span>
                <div class="category-info">
                    <p class="category-count">${count} publicación${count !== 1 ? 'es' : ''}</p>
                    <p class="category-description">Tu categoría más utilizada</p>
                </div>
            </div>
        `;
    }

    // Renderizar publicaciones recientes
    renderRecentPosts(posts) {
        const container = document.getElementById('profile-posts-container');
        if (!container) return;

        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-comments" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>No hay publicaciones aún</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.slice(0, 5).map(post => this.renderProfilePost(post)).join('');
    }

    // Renderizar una publicación en el perfil
    renderProfilePost(post) {
        const createdDate = new Date(post.fecha_creacion);
        const timeAgo = postsManager.getTimeAgo(createdDate);
        const categoryColor = postsManager.getCategoryColor(post.categoria);

        return `
            <div class="profile-post">
                <div class="profile-post-header">
                    <span class="profile-post-category" style="background-color: ${categoryColor};">
                        ${postsManager.getCategoryName(post.categoria)}
                    </span>
                    <span class="profile-post-time">${timeAgo}</span>
                </div>
                ${post.titulo ? `<h4 class="profile-post-title">${this.escapeHtml(post.titulo)}</h4>` : ''}
                <p class="profile-post-content">${this.truncateText(this.escapeHtml(post.contenido), 150)}</p>
                <div class="profile-post-stats">
                    <span class="post-stat">
                        <i class="fas fa-heart"></i> ${post.likes || 0}
                    </span>
                </div>
            </div>
        `;
    }

    // Actualizar elemento del DOM
    updateElement(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        }
    }

    // Escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Truncar texto
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Mostrar/ocultar perfil
    showProfile() {
        // Verificar que el usuario esté autenticado
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) {
            showToast('Debes iniciar sesión para ver el perfil', 'warning');
            return;
        }

        // Ocultar otras secciones
        document.getElementById('dashboard-section').classList.add('hidden');
        document.getElementById('auth-section').classList.add('hidden');
        
        // Mostrar perfil
        document.getElementById('profile-section').classList.remove('hidden');
        
        // Cargar datos del perfil
        this.loadUserProfile();
    }

    hideProfile() {
        document.getElementById('profile-section').classList.add('hidden');
    }
}

// Instancia global del gestor de perfiles
const profileManager = new ProfileManager();

// Función para mostrar perfil (llamada desde la navegación)
function showProfile() {
    console.log('🔍 showProfile() llamada');
    
    // Verificar que profileManager existe
    if (typeof profileManager === 'undefined') {
        console.error('❌ profileManager no está definido');
        showToast('Error: Gestor de perfiles no disponible', 'error');
        return;
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const profileLink = document.querySelector('a[href="#profile"]');
    if (profileLink) {
        profileLink.classList.add('active');
    }
    
    profileManager.showProfile();
}

// Función global para debugging
function debugProfile() {
    console.log('=== DEBUG PROFILE ===');
    console.log('authManager:', typeof authManager !== 'undefined' ? authManager : 'NO DEFINIDO');
    console.log('profileManager:', typeof profileManager !== 'undefined' ? profileManager : 'NO DEFINIDO');
    console.log('Usuario actual:', authManager?.getCurrentUser());
    console.log('API_ENDPOINTS:', typeof API_ENDPOINTS !== 'undefined' ? API_ENDPOINTS : 'NO DEFINIDO');
    console.log('====================');
}