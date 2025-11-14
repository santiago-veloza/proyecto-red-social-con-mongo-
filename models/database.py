from pymongo import MongoClient
import os

# Detectar entorno y cargar configuración apropiada
if os.getenv('FLASK_ENV') == 'production':
    from prod_config import ProductionConfig as Config
else:
    from config import Config

# Conexión optimizada para Vercel
MONGO_URI = os.getenv('MONGO_URI', Config.MONGO_URI)
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,  # 5 segundos max para conectar
    connectTimeoutMS=5000,         # 5 segundos max para establecer conexión
    socketTimeoutMS=10000,         # 10 segundos max para operaciones
    maxPoolSize=10,                # Pool de conexiones
    retryWrites=True
)

# Nombre de la base de datos
DB_NAME = getattr(Config, 'DB_NAME', 'red_social_ucc')
db = client[DB_NAME]

# Colecciones
usuarios_collection = db.usuarios
publicaciones_collection = db.publicaciones
comentarios_collection = db.comentarios
likes_collection = db.likes