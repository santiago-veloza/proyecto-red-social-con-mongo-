from flask import Blueprint, request, jsonify
from models.usuario import Usuario
from bson import ObjectId

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route("/usuarios", methods=["GET"])
def obtener_usuarios():
    """Obtiene todos los usuarios registrados"""
    try:
        usuarios = Usuario.obtener_todos()
        for u in usuarios:
            u["_id"] = str(u["_id"])
        return jsonify({
            "success": True,
            "usuarios": usuarios,
            "total": len(usuarios)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@usuarios_bp.route("/usuarios", methods=["POST"])
def crear_usuario():
    """Registra un nuevo usuario"""
    try:
        data = request.json
        
        # Validar campos requeridos
        if not all(k in data for k in ("nombre", "email", "contraseña")):
            return jsonify({
                "success": False,
                "error": "Nombre, email y contraseña son obligatorios"
            }), 400
        
        # Verificar si el email ya existe
        if Usuario.obtener_por_email(data["email"]):
            return jsonify({
                "success": False,
                "error": "El email ya está registrado"
            }), 400
        
        # Crear nuevo usuario
        nuevo_usuario = Usuario(
            nombre=data["nombre"],
            email=data["email"],
            contraseña=data["contraseña"],
            universidad=data.get("universidad"),
            carrera=data.get("carrera"),
            intereses=data.get("intereses", [])
        )
        
        resultado = nuevo_usuario.guardar()
        
        return jsonify({
            "success": True,
            "mensaje": "Usuario creado exitosamente",
            "user_id": str(resultado.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@usuarios_bp.route("/usuarios/<user_id>", methods=["GET"])
def obtener_usuario(user_id):
    """Obtiene un usuario por su ID"""
    try:
        usuario = Usuario.obtener_por_id(user_id)
        if not usuario:
            return jsonify({
                "success": False,
                "error": "Usuario no encontrado"
            }), 404
        
        # Remover contraseña de la respuesta
        usuario.pop("contraseña", None)
        usuario["_id"] = str(usuario["_id"])
        
        return jsonify({
            "success": True,
            "usuario": usuario
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@usuarios_bp.route("/usuarios/login", methods=["POST"])
def login():
    """Autentica un usuario"""
    try:
        data = request.json
        
        if not all(k in data for k in ("email", "contraseña")):
            return jsonify({
                "success": False,
                "error": "Email y contraseña son obligatorios"
            }), 400
        
        usuario = Usuario.obtener_por_email(data["email"])
        if not usuario:
            return jsonify({
                "success": False,
                "error": "Credenciales inválidas"
            }), 401
        
        # Verificar contraseña (necesitarás implementar esto en el modelo Usuario)
        # Por ahora, solo verificamos que exista
        
        usuario.pop("contraseña", None)
        usuario["_id"] = str(usuario["_id"])
        
        return jsonify({
            "success": True,
            "mensaje": "Login exitoso",
            "usuario": usuario
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@usuarios_bp.route("/usuarios/<user_id>/perfil", methods=["GET"])
def obtener_perfil_completo(user_id):
    """Obtiene el perfil completo de un usuario con estadísticas"""
    try:
        # Obtener usuario
        usuario = Usuario.obtener_por_id(user_id)
        if not usuario:
            return jsonify({
                "success": False,
                "error": "Usuario no encontrado"
            }), 404
        
        # Remover contraseña
        usuario.pop("contraseña", None)
        usuario["_id"] = str(usuario["_id"])
        
        # Obtener estadísticas del usuario
        from models.publicacion import Publicacion
        
        # Publicaciones del usuario
        publicaciones_usuario = Publicacion.obtener_por_usuario(user_id)
        
        # Calcular estadísticas
        total_publicaciones = len(publicaciones_usuario)
        total_likes_recibidos = sum(p.get("likes", 0) for p in publicaciones_usuario)
        
        # Categorías más usadas
        categorias = {}
        for pub in publicaciones_usuario:
            cat = pub.get("categoria", "general")
            categorias[cat] = categorias.get(cat, 0) + 1
        
        categoria_favorita = max(categorias.items(), key=lambda x: x[1])[0] if categorias else "general"
        
        # Preparar publicaciones para el frontend
        for p in publicaciones_usuario:
            p["_id"] = str(p["_id"])
            p["user_id"] = str(p["user_id"])
            if "usuarios_likes" in p:
                p["usuarios_likes"] = [str(uid) for uid in p["usuarios_likes"]]
            if "fecha" in p:
                p["fecha_creacion"] = p["fecha"]
        
        # Ordenar por fecha más reciente
        publicaciones_usuario.sort(key=lambda x: x.get("fecha", ""), reverse=True)
        
        perfil_completo = {
            "usuario": usuario,
            "estadisticas": {
                "total_publicaciones": total_publicaciones,
                "total_likes_recibidos": total_likes_recibidos,
                "categoria_favorita": categoria_favorita,
                "categorias_uso": categorias,
                "fecha_registro": usuario.get("fecha_registro")
            },
            "publicaciones_recientes": publicaciones_usuario[:10]  # Últimas 10
        }
        
        return jsonify({
            "success": True,
            "perfil": perfil_completo
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500