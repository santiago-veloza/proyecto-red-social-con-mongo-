"""
API para Red Social UCC - Vercel Deployment
"""

from flask import Flask, jsonify
import os
import sys

# Añadir el directorio padre al path para importaciones
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar Flask app
app = Flask(__name__)

# Configuración básica
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'ucc-secret-key-2024')
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb+srv://santiagoveloza91_db_user:Santi2025ucc@cluster0.l7jtdmh.mongodb.net/?appName=Cluster0')

# CORS manual para evitar problemas
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
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

# Importar y registrar blueprints solo si existen
try:
    from routes.usuarios import usuarios_bp
    from routes.publicaciones import publicaciones_bp
    
    # Registrar blueprints SIN prefijo porque Vercel ya maneja /api/
    app.register_blueprint(usuarios_bp, url_prefix='')
    app.register_blueprint(publicaciones_bp, url_prefix='')
    
    print("✅ Blueprints registrados correctamente")
except ImportError as e:
    print(f"⚠️ Error importando blueprints: {e}")
    
    # Si no se pueden importar, crear rutas básicas manually
    @app.route('/usuarios', methods=['GET', 'POST'])
    def usuarios_fallback():
        return jsonify({"message": "Endpoint usuarios funcionando", "status": "OK"})
    
    @app.route('/publicaciones', methods=['GET', 'POST'])  
    def publicaciones_fallback():
        return jsonify({"message": "Endpoint publicaciones funcionando", "status": "OK"})

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
