from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client[Config.DB_NAME]

# Colecciones
usuarios_collection = db.usuarios
publicaciones_collection = db.publicaciones
comentarios_collection = db.comentarios
likes_collection = db.likes