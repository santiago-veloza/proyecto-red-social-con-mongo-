from flask import Blueprint, request, jsonify
from models.publicacion import Publicacion
from models.usuario import Usuario
from bson import ObjectId

publicaciones_bp = Blueprint('publicaciones', __name__)

@publicaciones_bp.route("/publicaciones", methods=["GET"])
def obtener_publicaciones():
    """Obtiene todas las publicaciones con información del usuario"""
    try:
        categoria = request.args.get('categoria')
        user_id = request.args.get('user_id')
        personalizadas = request.args.get('personalizadas') == 'true'
        current_user_id = request.args.get('current_user_id')
        
        if categoria:
            publicaciones = Publicacion.obtener_por_categoria(categoria)
        elif user_id:
            publicaciones = Publicacion.obtener_por_usuario(user_id)
        elif personalizadas and current_user_id:
            # Obtener publicaciones basadas en intereses del usuario
            usuario = Usuario.obtener_por_id(current_user_id)
            if usuario and usuario.get("intereses"):
                user_interests = usuario["intereses"]
                # Si el usuario tiene todos los intereses posibles, mostrar todas las publicaciones
                all_categories = ["general", "academico", "eventos", "ayuda", "social"]
                if len(user_interests) >= 4 or set(user_interests) >= set(all_categories[:4]):
                    publicaciones = Publicacion.obtener_todas()
                else:
                    publicaciones = Publicacion.obtener_por_intereses(user_interests)
            else:
                publicaciones = Publicacion.obtener_todas()
        else:
            publicaciones = Publicacion.obtener_todas()
        
        # Ordenar por popularidad (likes) y luego por fecha
        publicaciones.sort(key=lambda x: (-(x.get("likes", 0)), x.get("fecha", "")), reverse=False)
        
        # Agregar información del usuario a cada publicación
        for p in publicaciones:
            p["_id"] = str(p["_id"])
            p["user_id"] = str(p["user_id"])
            
            # Convertir usuarios_likes a strings
            if "usuarios_likes" in p:
                p["usuarios_likes"] = [str(uid) for uid in p["usuarios_likes"]]
            else:
                p["usuarios_likes"] = []
            
            # Siempre mostrar el número total de likes
            p["total_likes"] = len(p["usuarios_likes"])
            
            # Verificar si el usuario actual dio like (si está especificado)
            if current_user_id:
                p["usuario_dio_like"] = current_user_id in p["usuarios_likes"]
            else:
                p["usuario_dio_like"] = False
                
            # Asegurar que el campo likes esté siempre presente
            if "likes" not in p or p["likes"] is None:
                p["likes"] = p["total_likes"]
            
            # Obtener información básica del usuario
            usuario = Usuario.obtener_por_id(p["user_id"])
            if usuario:
                # Agregar información del autor compatible con el frontend
                p["autor"] = {
                    "_id": str(usuario["_id"]),
                    "nombre": usuario["nombre"],
                    "universidad": usuario.get("universidad", ""),
                    "carrera": usuario.get("carrera", "")
                }
                # Mantener compatibilidad
                p["usuario_nombre"] = usuario["nombre"]
                p["usuario_universidad"] = usuario.get("universidad", "")
            
            # Agregar fecha_creacion para compatibilidad con frontend
            if "fecha" in p:
                p["fecha_creacion"] = p["fecha"]
        
        # Información de debug sobre likes
        total_posts = len(publicaciones)
        posts_with_likes = len([p for p in publicaciones if p.get("likes", 0) > 0])
        
        return jsonify({
            "success": True,
            "publicaciones": publicaciones,
            "total": len(publicaciones),
            "debug_info": {
                "total_posts": total_posts,
                "posts_with_likes": posts_with_likes,
                "user_id": current_user_id,
                "personalized": personalizadas
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@publicaciones_bp.route("/publicaciones", methods=["POST"])
def crear_publicacion():
    """Crea una nueva publicación"""
    try:
        data = request.json
        
        # Validar campos requeridos - ajustado para coincidir con el frontend
        autor_id = data.get("autor_id") or data.get("user_id")
        contenido = data.get("contenido")
        
        if not autor_id or not contenido:
            return jsonify({
                "success": False,
                "error": "autor_id y contenido son obligatorios"
            }), 400
        
        # Verificar que el usuario existe
        usuario = Usuario.obtener_por_id(autor_id)
        if not usuario:
            return jsonify({
                "success": False,
                "error": "Usuario no encontrado"
            }), 404
        
        # Crear nueva publicación
        nueva_publicacion = Publicacion(
            user_id=autor_id,
            contenido=contenido,
            categoria=data.get("categoria", "general"),
            titulo=data.get("titulo", ""),  # Título opcional
            imagen_url=data.get("imagen_url")
        )
        
        resultado = nueva_publicacion.guardar()
        
        return jsonify({
            "success": True,
            "mensaje": "Publicación creada exitosamente",
            "publicacion_id": str(resultado.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@publicaciones_bp.route("/publicaciones/<publicacion_id>", methods=["GET"])
def obtener_publicacion(publicacion_id):
    """Obtiene una publicación específica"""
    try:
        publicacion = Publicacion.obtener_por_id(publicacion_id)
        if not publicacion:
            return jsonify({
                "success": False,
                "error": "Publicación no encontrada"
            }), 404
        
        publicacion["_id"] = str(publicacion["_id"])
        publicacion["user_id"] = str(publicacion["user_id"])
        
        # Obtener información del usuario
        usuario = Usuario.obtener_por_id(publicacion["user_id"])
        if usuario:
            publicacion["usuario_nombre"] = usuario["nombre"]
            publicacion["usuario_universidad"] = usuario.get("universidad", "")
        
        return jsonify({
            "success": True,
            "publicacion": publicacion
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@publicaciones_bp.route("/publicaciones/<publicacion_id>/like", methods=["POST"])
def toggle_like(publicacion_id):
    """Alterna el like de una publicación (dar/quitar like)"""
    try:
        data = request.get_json() or {}
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "user_id es requerido"
            }), 400
        
        # Verificar que la publicación existe
        publicacion = Publicacion.obtener_por_id(publicacion_id)
        if not publicacion:
            return jsonify({
                "success": False,
                "error": "Publicación no encontrada"
            }), 404
        
        # Verificar si el usuario ya dio like
        ya_dio_like = Publicacion.usuario_dio_like(publicacion_id, user_id)
        
        if ya_dio_like:
            # Quitar like
            resultado = Publicacion.quitar_like(publicacion_id, user_id)
            accion = "removido"
            liked = False
        else:
            # Dar like
            resultado = Publicacion.dar_like(publicacion_id, user_id)
            accion = "agregado"
            liked = True
        
        if resultado.get("success") or resultado.get("already_liked"):
            # Obtener publicación actualizada
            publicacion_actualizada = Publicacion.obtener_por_id(publicacion_id)
            
            return jsonify({
                "success": True,
                "mensaje": f"Like {accion}",
                "data": {
                    "likes": publicacion_actualizada["likes"],
                    "usuario_dio_like": liked,
                    "publicacion_id": publicacion_id
                },
                # Mantener compatibilidad con versiones anteriores
                "likes": publicacion_actualizada["likes"],
                "usuario_dio_like": liked
            })
        else:
            return jsonify({
                "success": False,
                "error": resultado.get("message", "Error al procesar like")
            }), 500
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@publicaciones_bp.route("/publicaciones/<publicacion_id>/comentarios", methods=["POST"])
def agregar_comentario(publicacion_id):
    """Agrega un comentario a una publicación"""
    try:
        data = request.json
        
        if not all(k in data for k in ("user_id", "comentario")):
            return jsonify({
                "success": False,
                "error": "user_id y comentario son obligatorios"
            }), 400
        
        # Verificar que la publicación y el usuario existen
        publicacion = Publicacion.obtener_por_id(publicacion_id)
        if not publicacion:
            return jsonify({
                "success": False,
                "error": "Publicación no encontrada"
            }), 404
        
        usuario = Usuario.obtener_por_id(data["user_id"])
        if not usuario:
            return jsonify({
                "success": False,
                "error": "Usuario no encontrado"
            }), 404
        
        # Agregar comentario
        resultado = Publicacion.agregar_comentario(
            publicacion_id, 
            data["user_id"], 
            data["comentario"]
        )
        
        return jsonify({
            "success": True,
            "mensaje": "Comentario agregado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500