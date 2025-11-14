from bson import ObjectId
from datetime import datetime
from models.database import publicaciones_collection

class Publicacion:
    def __init__(self, user_id, contenido, categoria="general", titulo="", imagen_url=None):
        self.user_id = ObjectId(user_id)
        self.titulo = titulo  # Opcional para publicaciones tipo "post"
        self.contenido = contenido
        self.categoria = categoria
        self.imagen_url = imagen_url
        self.fecha = datetime.utcnow()
        self.likes = 0
        self.usuarios_likes = []  # Lista de IDs de usuarios que dieron like
        self.comentarios = []
        self.activa = True
    
    def to_dict(self):
        """Convierte la publicación a diccionario para MongoDB"""
        return {
            "user_id": self.user_id,
            "titulo": self.titulo,
            "contenido": self.contenido,
            "categoria": self.categoria,
            "imagen_url": self.imagen_url,
            "fecha": self.fecha,
            "likes": self.likes,
            "usuarios_likes": self.usuarios_likes,
            "comentarios": self.comentarios,
            "activa": self.activa
        }
    
    def guardar(self):
        """Guarda la publicación en la base de datos"""
        return publicaciones_collection.insert_one(self.to_dict())
    
    @staticmethod
    def obtener_todas():
        """Obtiene todas las publicaciones activas ordenadas por fecha"""
        return list(publicaciones_collection.find({"activa": True}).sort("fecha", -1))
    
    @staticmethod
    def obtener_por_usuario(user_id):
        """Obtiene todas las publicaciones de un usuario"""
        return list(publicaciones_collection.find({
            "user_id": ObjectId(user_id),
            "activa": True
        }).sort("fecha", -1))
    
    @staticmethod
    def obtener_por_categoria(categoria):
        """Obtiene publicaciones por categoría"""
        return list(publicaciones_collection.find({
            "categoria": categoria,
            "activa": True
        }).sort("fecha", -1))
    
    @staticmethod
    def obtener_por_id(publicacion_id):
        """Obtiene una publicación por su ID"""
        return publicaciones_collection.find_one({"_id": ObjectId(publicacion_id)})
    
    @staticmethod
    def dar_like(publicacion_id, user_id):
        """Da like a una publicación si el usuario no la ha likeado antes"""
        user_obj_id = ObjectId(user_id)
        
        # Verificar si el usuario ya dio like
        publicacion = publicaciones_collection.find_one({
            "_id": ObjectId(publicacion_id),
            "usuarios_likes": user_obj_id
        })
        
        if publicacion:
            return {"already_liked": True, "message": "Ya diste like a esta publicación"}
        
        # Dar like
        result = publicaciones_collection.update_one(
            {"_id": ObjectId(publicacion_id)},
            {
                "$inc": {"likes": 1},
                "$push": {"usuarios_likes": user_obj_id}
            }
        )
        
        if result.modified_count > 0:
            return {"success": True, "message": "Like agregado"}
        else:
            return {"success": False, "message": "Error al dar like"}
    
    @staticmethod
    def quitar_like(publicacion_id, user_id):
        """Quita el like de una publicación"""
        user_obj_id = ObjectId(user_id)
        
        result = publicaciones_collection.update_one(
            {"_id": ObjectId(publicacion_id)},
            {
                "$inc": {"likes": -1},
                "$pull": {"usuarios_likes": user_obj_id}
            }
        )
        
        if result.modified_count > 0:
            return {"success": True, "message": "Like removido"}
        else:
            return {"success": False, "message": "Error al quitar like"}
    
    @staticmethod
    def usuario_dio_like(publicacion_id, user_id):
        """Verifica si un usuario ya dio like a una publicación"""
        publicacion = publicaciones_collection.find_one({
            "_id": ObjectId(publicacion_id),
            "usuarios_likes": ObjectId(user_id)
        })
        return publicacion is not None
    
    @staticmethod
    def agregar_comentario(publicacion_id, user_id, comentario):
        """Agrega un comentario a una publicación"""
        nuevo_comentario = {
            "user_id": ObjectId(user_id),
            "comentario": comentario,
            "fecha": datetime.utcnow()
        }
        return publicaciones_collection.update_one(
            {"_id": ObjectId(publicacion_id)},
            {"$push": {"comentarios": nuevo_comentario}}
        )
    
    @staticmethod
    def obtener_por_intereses(intereses):
        """Obtiene publicaciones que coincidan con los intereses del usuario"""
        return list(publicaciones_collection.find({
            "categoria": {"$in": intereses},
            "activa": True
        }).sort("fecha", -1))