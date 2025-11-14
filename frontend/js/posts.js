// Gestión de publicaciones
class PostsManager {
    constructor() {
        this.posts = [];
        this.isLoading = false;
        this.sortType = 'popular'; // 'popular', 'recent'
    }

    // Cargar todas las publicaciones
    async loadPosts(personalized = true) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            
            let endpoint = API_ENDPOINTS.POSTS;
            
            // Si el usuario está logueado y quiere contenido personalizado
            const currentUser = authManager.getCurrentUser();
            if (personalized && currentUser && currentUser.intereses && currentUser.intereses.length > 0) {
                endpoint += `?personalizadas=true&current_user_id=${currentUser._id}`;
            }
            
            const response = await api.get(endpoint);
            ApiUtils.validateResponse(response);
            
            this.posts = response.publicaciones || [];
            
            // Asegurar que cada post tenga los campos necesarios para likes
            this.posts.forEach(post => {
                if (typeof post.likes === 'undefined') post.likes = 0;
                if (typeof post.usuario_dio_like === 'undefined') post.usuario_dio_like = false;
                
                // Si el post tiene usuarios_likes, usar esa información
                if (post.usuarios_likes && Array.isArray(post.usuarios_likes)) {
                    post.likes = post.usuarios_likes.length;
                }
                
                // Logging para debug
                console.log(`📊 Post ${post._id}: ${post.likes} likes, usuario_dio_like: ${post.usuario_dio_like}`);
            });
            
            // SIEMPRE ordenar por popularidad como comportamiento por defecto
            this.sortType = 'popular';
            this.renderPosts();
            this.updatePostsCount();
            
            // Mostrar mensaje si hay contenido personalizado
            if (personalized && currentUser && currentUser.intereses && currentUser.intereses.length > 0) {
                const feedTitle = document.querySelector('.posts-feed h3');
                if (feedTitle) {
                    feedTitle.innerHTML = '<i class="fas fa-star"></i> Publicaciones Recomendadas Para Ti';
                }
            }
            
        } catch (error) {
            console.error('Error loading posts:', error);
            ApiUtils.handleNetworkError(error);
        } finally {
            this.isLoading = false;
        }
    }

    // Crear nueva publicación
    async createPost(title, content, category = 'general') {
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) {
            showToast('Debes estar logueado para publicar', 'error');
            return false;
        }

        if (!content.trim()) {
            showToast('El contenido no puede estar vacío', 'warning');
            return false;
        }

        try {
            const postData = {
                autor_id: currentUser._id,
                contenido: content.trim(),
                categoria: category
            };

            // Solo añadir título si no está vacío
            if (title && title.trim()) {
                postData.titulo = title.trim();
            }

            const response = await api.post(API_ENDPOINTS.POSTS, postData);

            ApiUtils.validateResponse(response);

            if (response.success) {
                showToast('¡Publicación creada exitosamente!', 'success');
                // Recargar publicaciones para mostrar la nueva
                await this.loadPosts();
                return true;
            } else {
                throw new Error(response.error || 'Error al crear la publicación');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            ApiUtils.handleNetworkError(error);
            return false;
        }
    }

    // Renderizar publicaciones en la UI
    renderPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3>No hay publicaciones aún</h3>
                    <p>¡Sé el primero en compartir algo!</p>
                </div>
            `;
            return;
        }

        // Obtener posts ordenados según preferencia
        const sortedPosts = this.getSortedPosts();

        container.innerHTML = sortedPosts.map(post => this.renderPost(post)).join('');
    }

    // Renderizar una publicación individual
    renderPost(post) {
        const author = post.autor || { nombre: 'Usuario Desconocido' };
        const createdDate = new Date(post.fecha_creacion);
        const timeAgo = this.getTimeAgo(createdDate);
        const categoryColor = this.getCategoryColor(post.categoria);
        const currentUser = authManager.getCurrentUser();
        
        // Verificar si el usuario actual dio like
        const userLiked = Boolean(post.usuario_dio_like);
        const likeIconClass = userLiked ? 'fas' : 'far';
        const likedClass = userLiked ? 'liked' : '';
        
        // Asegurar que likes sea un número
        const likesCount = parseInt(post.likes) || 0;
        
        // Mostrar título solo si existe y no está vacío
        const titleHtml = post.titulo && post.titulo.trim() ? 
            `<div class="post-title">${this.formatContent(post.titulo)}</div>` : '';

        // Determinar si es un post popular (1 o más likes)
        const isPopular = likesCount >= 1;
        
        return `
            <div class="post ${isPopular ? 'popular' : ''}" data-post-id="${post._id}">
                <div class="post-header">
                    <div class="post-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="post-info">
                        <h4>${author.nombre}</h4>
                        <div class="post-meta">
                            <span>${timeAgo}</span>
                            <span class="post-category" style="background-color: ${categoryColor};">
                                ${this.getCategoryName(post.categoria)}
                            </span>
                        </div>
                    </div>
                </div>
                ${titleHtml}
                <div class="post-content">
                    ${this.formatContent(post.contenido)}
                </div>
                <div class="post-reactions">
                    <div class="post-likes-count">
                        ${likesCount > 0 ? `
                            <div class="likes-display">
                                <div class="like-icons">
                                    <i class="fas fa-heart like-icon-small"></i>
                                </div>
                                <span class="likes-text">${this.formatLikesCount(likesCount)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="post-actions">
                    <button class="post-action ${likedClass}" onclick="likePost('${post._id}')" ${!currentUser ? 'disabled title="Inicia sesión para dar me gusta"' : ''}>
                        <i class="${likeIconClass} fa-heart"></i>
                        <span>${currentUser ? 'Me gusta' : `${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`}</span>
                    </button>
                    <button class="post-action" onclick="sharePost('${post._id}')">
                        <i class="fas fa-share"></i>
                        <span>Compartir</span>
                    </button>
                    <button class="post-action" onclick="reportPost('${post._id}')">
                        <i class="fas fa-flag"></i>
                        <span>Reportar</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Formatear contenido del post
    formatContent(content) {
        // Escapar HTML para seguridad
        const escaped = content.replace(/[&<>"']/g, function(match) {
            const htmlEscapes = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return htmlEscapes[match];
        });

        // Convertir URLs en enlaces
        const withLinks = escaped.replace(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
            '<a href="$&" target="_blank" rel="noopener">$&</a>'
        );

        // Convertir saltos de línea
        return withLinks.replace(/\n/g, '<br>');
    }

    // Obtener tiempo transcurrido
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    // Obtener nombre de categoría
    getCategoryName(category) {
        const categories = {
            'general': 'General',
            'academico': 'Académico',
            'eventos': 'Eventos',
            'ayuda': 'Ayuda',
            'social': 'Social'
        };
        return categories[category] || 'General';
    }

    // Obtener color de categoría
    getCategoryColor(category) {
        const colors = {
            'general': '#3b82f6',
            'academico': '#10b981',
            'eventos': '#f59e0b',
            'ayuda': '#ef4444',
            'social': '#8b5cf6'
        };
        return colors[category] || '#3b82f6';
    }

    // Cambiar tipo de ordenamiento
    setSortType(sortType) {
        this.sortType = sortType;
        this.renderPosts();
    }

    // Obtener posts ordenados según el tipo seleccionado
    getSortedPosts() {
        const posts = [...this.posts];
        
        switch (this.sortType) {
            case 'popular':
                return posts.sort((a, b) => {
                    const likesA = a.likes || 0;
                    const likesB = b.likes || 0;
                    if (likesA !== likesB) {
                        return likesB - likesA;
                    }
                    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
                });
            
            case 'recent':
                return posts.sort((a, b) => 
                    new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
                );
            
            default:
                // Por defecto: popular primero
                return posts.sort((a, b) => {
                    const likesA = a.likes || 0;
                    const likesB = b.likes || 0;
                    if (likesA !== likesB) {
                        return likesB - likesA;
                    }
                    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
                });
        }
    }

    // Formatear contador de likes estilo Facebook
    formatLikesCount(count) {
        if (count === 0) return '';
        if (count === 1) return '1 persona';
        if (count < 1000) return `${count} personas`;
        if (count < 1000000) return `${(count / 1000).toFixed(1)}K personas`;
        return `${(count / 1000000).toFixed(1)}M personas`;
    }

    // Actualizar contador de posts
    updatePostsCount() {
        const postsCountElement = document.getElementById('posts-count');
        const totalPostsElement = document.getElementById('total-posts');
        
        if (postsCountElement) {
            const userPosts = this.posts.filter(post => 
                post.autor && post.autor._id === authManager.getCurrentUser()?._id
            );
            postsCountElement.textContent = userPosts.length;
        }
        
        if (totalPostsElement) {
            totalPostsElement.textContent = this.posts.length;
        }
    }
}

// Instancia global del gestor de publicaciones
const postsManager = new PostsManager();

// Función para crear publicación (llamada desde el formulario)
async function createPost(event) {
    event.preventDefault();
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const category = document.getElementById('post-category').value;
    
    const success = await postsManager.createPost(title, content, category);
    
    if (success) {
        // Limpiar formulario
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-category').value = 'general';
    }
}

// Funciones de acciones en posts
async function likePost(postId) {
    console.log('❤️ likePost llamada para:', postId);
    
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) {
        showToast('Debes estar logueado para dar me gusta', 'error');
        return;
    }

    try {
        console.log('📡 Enviando request de like para usuario:', currentUser._id);
        const response = await api.post(API_ENDPOINTS.POSTS + '/' + postId + '/like', {
            user_id: currentUser._id
        });

        console.log('📥 Respuesta del servidor:', response);
        ApiUtils.validateResponse(response);

        if (response.success) {
            console.log('✅ Like procesado exitosamente');
            console.log('💾 Datos recibidos:', response.data || response);
            // Actualizar el estado local del post
            const post = postsManager.posts.find(p => p._id === postId);
            if (post) {
                // Actualizar datos del post con la respuesta del servidor
                post.likes = response.data?.likes || response.likes || 0;
                post.usuario_dio_like = response.data?.usuario_dio_like || response.usuario_dio_like || false;
                
                // Actualizar solo este post en el DOM
                const postElement = document.querySelector(`[data-post-id="${postId}"]`);
                if (postElement) {
                    const likeButton = postElement.querySelector('.post-action');
                    const likeIcon = likeButton.querySelector('i');
                    
                    // Actualizar contador de likes estilo Facebook
                    const likesDisplay = postElement.querySelector('.post-likes-count');
                    if (post.likes > 0) {
                        likesDisplay.innerHTML = `
                            <div class="likes-display">
                                <div class="like-icons">
                                    <i class="fas fa-heart like-icon-small"></i>
                                </div>
                                <span class="likes-text">${postsManager.formatLikesCount(post.likes)}</span>
                            </div>
                        `;
                    } else {
                        likesDisplay.innerHTML = '';
                    }
                    
                    // Actualizar estado visual del botón
                    if (post.usuario_dio_like) {
                        likeIcon.classList.remove('far');
                        likeIcon.classList.add('fas');
                        likeButton.classList.add('liked');
                        showToast(`¡Te gusta esta publicación! (${post.likes} ${post.likes === 1 ? 'like' : 'likes'})`, 'success');
                    } else {
                        likeIcon.classList.remove('fas');
                        likeIcon.classList.add('far');
                        likeButton.classList.remove('liked');
                        showToast(`Like removido (${post.likes} ${post.likes === 1 ? 'like' : 'likes'})`, 'info');
                    }
                    
                    // Reordenar posts después del like/unlike
                    setTimeout(() => {
                        postsManager.renderPosts();
                    }, 300);
                }
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        ApiUtils.handleNetworkError(error);
    }
}

function sharePost(postId) {
    // Copiar enlace al portapapeles (funcionalidad básica)
    const url = `${window.location.origin}#post-${postId}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('¡Enlace copiado al portapapeles!', 'success');
    }).catch(() => {
        showToast('No se pudo copiar el enlace', 'error');
    });
}

function reportPost(postId) {
    if (confirm('¿Estás seguro que quieres reportar esta publicación?')) {
        showToast('Reporte enviado. Revisaremos el contenido.', 'success');
    }
}

// Alternar tipo de feed
function toggleFeedType(type) {
    const btnPersonalized = document.getElementById('btn-personalized');
    const btnAll = document.getElementById('btn-all');
    
    // Actualizar botones activos
    if (type === 'personalized') {
        btnPersonalized.classList.add('active');
        btnAll.classList.remove('active');
        postsManager.loadPosts(true); // Cargar posts personalizados
    } else {
        btnAll.classList.add('active');
        btnPersonalized.classList.remove('active');
        postsManager.loadPosts(false); // Cargar todos los posts
    }
}

// Alternar tipo de ordenamiento
function toggleSortType(type) {
    const btnPopular = document.getElementById('btn-sort-popular');
    const btnRecent = document.getElementById('btn-sort-recent');
    
    console.log('🔄 Cambiando ordenamiento a:', type);
    
    // Actualizar botones activos
    if (type === 'popular') {
        if (btnPopular) btnPopular.classList.add('active');
        if (btnRecent) btnRecent.classList.remove('active');
        postsManager.setSortType('popular');
    } else {
        if (btnRecent) btnRecent.classList.add('active');
        if (btnPopular) btnPopular.classList.remove('active');
        postsManager.setSortType('recent');
    }
}