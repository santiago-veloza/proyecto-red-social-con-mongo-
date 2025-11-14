"""
API para Red Social UCC - Vercel Deployment
"""

from flask import Flask, jsonify
import os
import sys

# Añadir el directorio padre al path para importaciones
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Configurar Flask app
app = Flask(__name__)

# Configuración para Vercel
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'ucc-secret-key-2024')
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb+srv://santiagoveloza91_db_user:Santi2025ucc@cluster0.l7jtdmh.mongodb.net/?appName=Cluster0')

# CORS configurado correctamente para Vercel
@app.after_request
def after_request(response):
    # Permitir todos los orígenes en desarrollo y producción
    origin = os.getenv('FRONTEND_URL', '*')
    response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Manejar preflight requests
@app.before_request
def handle_preflight():
    from flask import request
    if request.method == "OPTIONS":
        response = jsonify({"message": "OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response

# Health check básico - FUNCIONA en Vercel como /api/health
@app.route('/')
@app.route('/health')
def health_check():
    """Endpoint básico de salud"""
    return jsonify({
        "status": "OK",
        "message": "UCC Red Social API funcionando",
        "version": "1.0"
    })

# Importar y registrar blueprints
try:
    # Intentar importar los blueprints
    from routes.usuarios import usuarios_bp
    from routes.publicaciones import publicaciones_bp
    
    # Registrar blueprints SIN prefijo porque Vercel ya maneja /api/
    app.register_blueprint(usuarios_bp, url_prefix='')
    app.register_blueprint(publicaciones_bp, url_prefix='')
    
    print("✅ Blueprints registrados correctamente")
    
except ImportError as e:
    print(f"⚠️ Error importando blueprints: {e}")
    print(f"Python path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    
    # Rutas de fallback si no se pueden importar los blueprints
    @app.route('/usuarios', methods=['GET', 'POST', 'OPTIONS'])
    def usuarios_fallback():
        return jsonify({
            "message": "Endpoint usuarios funcionando (fallback)", 
            "status": "OK",
            "error": "Blueprints no disponibles"
        })
    
    @app.route('/publicaciones', methods=['GET', 'POST', 'OPTIONS'])  
    def publicaciones_fallback():
        return jsonify({
            "message": "Endpoint publicaciones funcionando (fallback)", 
            "status": "OK",
            "error": "Blueprints no disponibles"
        })

# Ruta de información de la API
@app.route('/info')
def api_info():
    return jsonify({
        "name": "Red Social UCC",
        "university": "Universidad Cooperativa de Colombia",
        "endpoints": {
            "health": "/health",
            "usuarios": "/usuarios", 
            "publicaciones": "/publicaciones"
        }
    })

# Para Vercel - exportar la aplicación
application = app

if __name__ == "__main__":
    app.run(debug=True, port=5000)
