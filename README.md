# 🎓 Red Social Universitaria

Una API REST para una red social enfocada en estudiantes universitarios, desarrollada con Flask y MongoDB.

## 🚀 Características

- ✅ Sistema de usuarios con autenticación
- ✅ Publicaciones con categorías
- ✅ Sistema de likes y comentarios  
- ✅ Filtrado por universidad y carrera
- ✅ API REST bien estructurada
- ✅ Manejo de errores robusto

## 🛠️ Tecnologías

- **Backend**: Flask (Python)
- **Base de datos**: MongoDB Atlas
- **Autenticación**: bcrypt para hash de contraseñas
- **CORS**: Habilitado para frontend

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd proyecto-red-social-con-mongo
```

2. **Crear entorno virtual**
```bash
python -m venv venv
```

3. **Activar entorno virtual**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac  
source venv/bin/activate
```

4. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

5. **Configurar variables de entorno**
- Copia el archivo `.env` y actualiza las variables según tu configuración
- Cambia la `SECRET_KEY` por una clave segura

6. **Ejecutar la aplicación**
```bash
python app.py
```

## 📖 Endpoints de la API

### Base URL: `http://localhost:5000/api`

### 👥 Usuarios

#### GET /usuarios
Obtiene todos los usuarios registrados
```json
{
  "success": true,
  "usuarios": [...],
  "total": 5
}
```

#### POST /usuarios
Registra un nuevo usuario
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@universidad.edu",
  "contraseña": "password123",
  "universidad": "Universidad Nacional",
  "carrera": "Ingeniería de Sistemas"
}
```

#### GET /usuarios/{user_id}
Obtiene un usuario específico

#### POST /usuarios/login
Autentica un usuario
```json
{
  "email": "juan@universidad.edu",
  "contraseña": "password123"
}
```

### 📝 Publicaciones

#### GET /publicaciones
Obtiene todas las publicaciones
- Query params opcionales: `categoria`, `user_id`

#### POST /publicaciones
Crea una nueva publicación
```json
{
  "user_id": "60d5ec49f1b2c8b1a8c4e5f6",
  "titulo": "Mi primera publicación",
  "contenido": "Contenido de la publicación...",
  "categoria": "academico",
  "imagen_url": "https://ejemplo.com/imagen.jpg"
}
```

#### GET /publicaciones/{publicacion_id}
Obtiene una publicación específica

#### POST /publicaciones/{publicacion_id}/like
Da like a una publicación

#### POST /publicaciones/{publicacion_id}/comentarios
Agrega un comentario a una publicación
```json
{
  "user_id": "60d5ec49f1b2c8b1a8c4e5f6",
  "comentario": "¡Excelente publicación!"
}
```

## 🗂️ Estructura del Proyecto

```
proyecto-red-social-con-mongo/
│
├── app.py                 # Aplicación principal
├── config.py             # Configuraciones
├── requirements.txt      # Dependencias
├── .env                 # Variables de entorno
│
├── models/              # Modelos de datos
│   ├── database.py      # Conexión a MongoDB
│   ├── usuario.py       # Modelo Usuario
│   └── publicacion.py   # Modelo Publicación
│
└── routes/              # Rutas de la API
    ├── usuarios.py      # Endpoints de usuarios
    └── publicaciones.py # Endpoints de publicaciones
```

## 🧪 Ejemplos de Uso

### 1. Registrar un usuario
```bash
curl -X POST http://localhost:5000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García",
    "email": "maria@universidad.edu",
    "contraseña": "password123",
    "universidad": "Universidad Nacional",
    "carrera": "Psicología"
  }'
```

### 2. Crear una publicación
```bash
curl -X POST http://localhost:5000/api/publicaciones \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID_AQUI",
    "titulo": "Consejos para estudiar",
    "contenido": "Aquí están mis mejores consejos para estudiar eficientemente...",
    "categoria": "academico"
  }'
```

### 3. Obtener publicaciones por categoría
```bash
curl http://localhost:5000/api/publicaciones?categoria=academico
```

## 🔧 Configuración de MongoDB

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un nuevo cluster
3. Configura un usuario de base de datos
4. Obtén la cadena de conexión
5. Actualiza `MONGO_URI` en el archivo `.env`

## 🚦 Estados de Respuesta

- `200` - OK
- `201` - Creado
- `400` - Error en la petición
- `401` - No autorizado
- `404` - No encontrado  
- `500` - Error del servidor

## 🔄 Próximas Mejoras

- [ ] Sistema de autenticación JWT
- [ ] Subida de imágenes
- [ ] Sistema de seguimiento entre usuarios
- [ ] Notificaciones en tiempo real
- [ ] Sistema de mensajería privada
- [ ] Moderación de contenido
- [ ] API de búsqueda avanzada



## 📄 Licencia
