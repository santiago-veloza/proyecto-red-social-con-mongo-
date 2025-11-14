from bson import ObjectId
from datetime import datetime
import bcrypt
from models.database import usuarios_collection

class Usuario:
    def __init__(self, nombre, email, contraseña, universidad=None, carrera=None, intereses=None):
        self.nombre = nombre
        self.email = email
        self.contraseña = self._hash_contraseña(contraseña)
        self.universidad = universidad
        self.carrera = carrera
        self.intereses = intereses if intereses is not None else []
        self.fecha_registro = datetime.utcnow()
        self.activo = True
        self.seguidores = []
        self.siguiendo = []
    
    def _hash_contraseña(self, contraseña):
        """Hashea la contraseña usando bcrypt"""
        return bcrypt.hashpw(contraseña.encode('utf-8'), bcrypt.gensalt())
    
    def verificar_contraseña(self, contraseña):
        """Verifica si la contraseña es correcta"""
        return bcrypt.checkpw(contraseña.encode('utf-8'), self.contraseña)
    
    def to_dict(self):
        """Convierte el usuario a diccionario para MongoDB"""
        return {
            "nombre": self.nombre,
            "email": self.email,
            "contraseña": self.contraseña,
            "universidad": self.universidad,
            "carrera": self.carrera,
            "intereses": self.intereses,
            "fecha_registro": self.fecha_registro,
            "activo": self.activo,
            "seguidores": self.seguidores,
            "siguiendo": self.siguiendo
        }
    
    def guardar(self):
        """Guarda el usuario en la base de datos"""
        return usuarios_collection.insert_one(self.to_dict())
    
    @staticmethod
    def obtener_por_email(email):
        """Obtiene un usuario por su email"""
        return usuarios_collection.find_one({"email": email})
    
    @staticmethod
    def obtener_por_id(user_id):
        """Obtiene un usuario por su ID"""
        return usuarios_collection.find_one({"_id": ObjectId(user_id)})
    
    @staticmethod
    def obtener_todos():
        """Obtiene todos los usuarios (sin contraseñas)"""
        return list(usuarios_collection.find({}, {"contraseña": 0}))
    
    @staticmethod
    def obtener_publicaciones_recomendadas(user_id):
        """Obtiene publicaciones basadas en los intereses del usuario"""
        from models.publicacion import Publicacion
        
        usuario = Usuario.obtener_por_id(user_id)
        if not usuario or not usuario.get("intereses"):
            # Si no tiene intereses, devolver todas las publicaciones
            return Publicacion.obtener_todas()
        
        # Obtener publicaciones que coincidan con los intereses del usuario
        return Publicacion.obtener_por_intereses(usuario["intereses"])