from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os

def create_app(config_name=None):
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Configuración según el entorno
    if config_name:
        app.config.from_object(config_name)
    elif os.getenv('FLASK_ENV') == 'production':
        from prod_config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from config import Config
        app.config.from_object(Config)

    # Habilitar CORS
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:3000', 'http://localhost:5000']))
    
    # Importar blueprints
    from routes.usuarios import usuarios_bp
    from routes.publicaciones import publicaciones_bp
    
    # Registro de Blueprints (rutas)
    app.register_blueprint(usuarios_bp, url_prefix='/api')
    app.register_blueprint(publicaciones_bp, url_prefix='/api')
    
    return app

# Crear aplicación para desarrollo
app = create_app()

# Los blueprints se registran dentro de create_app()

# -----------------------------
#  Rutas del Frontend
# -----------------------------
@app.route("/")
def frontend():
    """Servir el frontend"""
    return send_file('frontend/index.html')

@app.route("/css/<path:filename>")
def serve_css(filename):
    """Servir archivos CSS"""
    return send_from_directory('frontend/css', filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    """Servir archivos JavaScript"""
    return send_from_directory('frontend/js', filename)

@app.route("/images/<path:filename>")
def serve_images(filename):
    """Servir imágenes"""
    return send_from_directory('frontend/images', filename)

@app.route("/frontend/<path:filename>")
def frontend_static(filename):
    """Servir archivos estáticos del frontend"""
    return send_from_directory('frontend', filename)

# -----------------------------
#  Ruta de información de la API
# -----------------------------
@app.route("/api")
def api_info():
    return jsonify({
        "mensaje": "Bienvenido a la API de Red Social Universitaria",
        "version": "1.0",
        "endpoints": {
            "usuarios": "/api/usuarios",
            "publicaciones": "/api/publicaciones",
            "health": "/api/health",
            "frontend": "/"
        }
    })

@app.route("/api/health")
def health_check():
    """Endpoint para verificar que la API está funcionando"""
    return jsonify({
        "status": "OK",
        "mensaje": "API funcionando correctamente"
    })

# -----------------------------
#  Iniciar el servidor
# -----------------------------
if __name__ == "__main__":
    print("🚀 Iniciando Red Social Universitaria...")
    print("📍 Frontend disponible en: http://localhost:5000")
    print("📡 API disponible en: http://localhost:5000/api")
    print("🩺 Health check: http://localhost:5000/api/health")
    
    # Configuración más estable para Windows
    app.run(
        debug=app.config.get('DEBUG', True),
        host='127.0.0.1',  # Solo localhost para evitar problemas de red
        port=5000,
        use_reloader=True,  # Activar reloader explícitamente
        threaded=True       # Usar threading para mejor rendimiento
    )
