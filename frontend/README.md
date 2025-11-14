# 🎨 Frontend - Red Social Universitaria

Interfaz web moderna y responsiva para la red social universitaria.

## 🚀 Características

- **Diseño Responsivo**: Se adapta a dispositivos móviles y desktop
- **Interfaz Moderna**: Usando CSS Grid, Flexbox y animaciones suaves
- **Componentes Modulares**: JavaScript organizado en módulos
- **Autenticación**: Sistema completo de login y registro
- **Feed en Tiempo Real**: Visualización de publicaciones
- **Notificaciones**: Sistema de toast para feedback al usuario
- **Modo Offline**: Manejo de errores de conectividad

## 📁 Estructura

```
frontend/
├── index.html          # Página principal
├── css/
│   └── style.css      # Estilos principales
├── js/
│   ├── api.js         # Cliente de API y configuración
│   ├── auth.js        # Manejo de autenticación
│   ├── posts.js       # Gestión de publicaciones
│   ├── utils.js       # Utilidades y helpers
│   └── main.js        # Inicialización y configuración
└── images/            # Recursos de imágenes
```

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Sistema de autenticación (login/registro)
- [x] Dashboard con información del usuario
- [x] Crear y visualizar publicaciones
- [x] Categorización de posts
- [x] Feed de publicaciones en tiempo real
- [x] Navegación responsiva
- [x] Sistema de notificaciones
- [x] Manejo de errores

### 🚧 En Desarrollo
- [ ] Sistema de likes y reacciones
- [ ] Comentarios en publicaciones
- [ ] Perfil de usuario editable
- [ ] Chat en tiempo real
- [ ] Búsqueda de usuarios y posts
- [ ] Notificaciones push

### 🔮 Futuras Mejoras
- [ ] Modo oscuro
- [ ] Subida de imágenes
- [ ] Historias temporales
- [ ] Grupos y comunidades
- [ ] Eventos universitarios
- [ ] Integración con calendario académico

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: 
  - Variables CSS para temas
  - Grid y Flexbox para layouts
  - Animaciones y transiciones
  - Media queries para responsividad
- **JavaScript ES6+**:
  - Fetch API para comunicación con backend
  - Async/await para operaciones asíncronas
  - Clases para organización del código
  - Módulos para separación de responsabilidades
- **Font Awesome**: Iconografía
- **API REST**: Comunicación con backend Flask

## 🎨 Paleta de Colores

```css
:root {
    --primary-color: #3b82f6;      /* Azul principal */
    --primary-dark: #2563eb;       /* Azul oscuro */
    --secondary-color: #64748b;    /* Gris azulado */
    --success-color: #10b981;      /* Verde éxito */
    --warning-color: #f59e0b;      /* Amarillo advertencia */
    --error-color: #ef4444;        /* Rojo error */
    --background-color: #f8fafc;   /* Fondo principal */
    --card-background: #ffffff;    /* Fondo de tarjetas */
    --text-primary: #1e293b;       /* Texto principal */
    --text-secondary: #64748b;     /* Texto secundario */
}
```

## 📱 Características Responsivas

- **Mobile First**: Diseñado primero para móviles
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Navegación Adaptativa**: Menú hamburguesa en móviles
- **Grid Flexible**: Diseño que se adapta al tamaño de pantalla

## 🔧 Configuración de Desarrollo

### Variables de Configuración (api.js)
```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};
```

### Estructura de Clases Principales

- **`APIClient`**: Manejo de comunicación con backend
- **`AuthManager`**: Gestión de autenticación y sesiones
- **`PostsManager`**: Manejo de publicaciones
- **`UsersManager`**: Gestión de usuarios
- **`Utils`**: Utilidades generales

## 🚀 Cómo Ejecutar

1. **Asegúrate de que el backend esté corriendo:**
   ```bash
   python app.py
   ```

2. **Abre tu navegador en:**
   ```
   http://localhost:5000
   ```

3. **Para desarrollo, puedes usar Live Server de VS Code o similar**

## 🧪 Testing

### Verificaciones Manuales
- [ ] Registro de nuevo usuario
- [ ] Login con credenciales válidas
- [ ] Creación de publicaciones
- [ ] Navegación responsive
- [ ] Manejo de errores de API

### Tests Automatizados (Futuros)
- Unit tests para utilidades
- Integration tests para flujos de usuario
- E2E tests con Cypress

## 🐛 Solución de Problemas

### ❌ "No se puede conectar con el servidor"
- Verifica que Flask esté ejecutándose en puerto 5000
- Revisa la consola del navegador para errores CORS
- Confirma que la URL de la API sea correcta

### ❌ "Error de autenticación"
- Verifica credenciales
- Revisa que el backend maneje correctamente las rutas de auth
- Confirma formato JSON en las peticiones

### ❌ "Publicaciones no cargan"
- Verifica conexión a MongoDB
- Revisa logs del backend
- Confirma que existan publicaciones en la base de datos

## 📈 Métricas y Analytics (Futuro)

- Tiempo de carga de páginas
- Interacciones de usuario
- Errores de JavaScript
- Uso de funcionalidades

## 🎯 Optimizaciones

- **Lazy Loading**: Para imágenes y contenido
- **Service Workers**: Para funcionalidad offline
- **Bundling**: Webpack para producción
- **Minificación**: CSS y JS optimizados
- **CDN**: Para assets estáticos

## 🤝 Contribuciones

Para contribuir al frontend:

1. Mantén la consistencia en el estilo de código
2. Usa la paleta de colores definida
3. Asegúrate de que sea responsive
4. Agrega comentarios para código complejo
5. Testa en múltiples navegadores