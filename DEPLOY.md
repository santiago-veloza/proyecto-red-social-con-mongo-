# 🎓 UCC - Red Social Universitaria

Red social para la Universidad Cooperativa de Colombia desarrollada con Flask y MongoDB.

## 🚀 Desplegar en Vercel

### 1. Preparar el proyecto

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd proyecto-red-social-con-mongo

# Instalar dependencias (opcional, para desarrollo local)
pip install -r requirements.txt
```

### 2. Configurar Vercel

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Hacer login en Vercel**:
```bash
vercel login
```

3. **Desplegar el proyecto**:
```bash
vercel
```

### 3. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a tu proyecto > Settings > Environment Variables y añade:

```
MONGO_URI = tu_mongodb_connection_string
SECRET_KEY = tu_clave_secreta_segura
FLASK_ENV = production
```

### 4. Dominios y URLs

- **Frontend**: Tu dominio de Vercel (ej: `tu-proyecto.vercel.app`)
- **API**: `tu-proyecto.vercel.app/api`
- **Health Check**: `tu-proyecto.vercel.app/api/health`

## 🛠️ Desarrollo Local

```bash
# Activar entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
.\venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar en desarrollo
python run_dev.py
```

## 📁 Estructura del Proyecto

```
├── app.py              # Aplicación Flask principal
├── vercel_app.py       # Punto de entrada para Vercel
├── vercel.json         # Configuración de Vercel
├── requirements.txt    # Dependencias Python
├── prod_config.py      # Configuración de producción
├── frontend/           # Archivos estáticos
│   ├── index.html
│   ├── css/
│   └── js/
├── models/             # Modelos de datos
├── routes/             # Rutas de la API
└── README.md

```

## 🔧 Características

- ✅ Sistema de autenticación
- ✅ Publicaciones con likes
- ✅ Feed personalizado por intereses
- ✅ Perfiles de usuario
- ✅ Interfaz estilo Facebook
- ✅ Responsive design
- ✅ Específico para UCC

## 📞 Soporte

Si tienes problemas con el despliegue, verifica:

1. Variables de entorno configuradas correctamente
2. MongoDB Atlas permite conexiones desde cualquier IP (0.0.0.0/0)
3. El dominio de Vercel está permitido en CORS

## 🎯 Funcionalidades UCC

- Email institucional requerido (@ucc.edu.co)
- Universidad fija: Universidad Cooperativa de Colombia
- Feed ordenado por popularidad
- Sistema de likes en tiempo real