#!/bin/bash

echo "🚀 Iniciando Red Social Universitaria..."

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo "📚 Instalando dependencias..."
pip install -r requirements.txt

# Ejecutar script de inicialización si es la primera vez
if [ "$1" = "--init" ]; then
    echo "🗄️  Inicializando base de datos..."
    python init_db.py
fi

# Iniciar la aplicación
echo "🌟 Iniciando aplicación..."
python app.py