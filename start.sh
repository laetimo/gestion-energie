#!/bin/bash

# Script de démarrage rapide pour gestion-energie
# Usage: ./start.sh [option]

set -e  # Arrêter si erreur

echo "⚡ Gestion d'Énergie - Script de démarrage"
echo "==========================================="
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "📦 Installez Node.js depuis https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version $(node --version)"
echo ""

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install --production
    echo "✅ Dépendances installées"
    echo ""
fi

# Créer le dossier data s'il n'existe pas
if [ ! -d "data" ]; then
    mkdir -p data
    echo "📁 Dossier data créé"
fi

# Vérifier si .env existe
if [ ! -f ".env" ]; then
    echo "⚙️  Configuration non trouvée, création depuis .env.example..."
    cp .env.example .env
    echo "📝 Fichier .env créé, veuillez éditer avec vos paramètres:"
    echo "   nano .env"
    echo ""
fi

# Choix mode de démarrage
echo "Mode de démarrage:"
echo "  1) Développement (avec auto-reload)"
echo "  2) Production"
echo "  3) Docker"
echo ""
read -p "Choisissez (1-3): " choice

case $choice in
    1)
        echo "🚀 Démarrage en mode développement..."
        npm run dev
        ;;
    2)
        echo "🚀 Démarrage en mode production..."
        npm start
        ;;
    3)
        echo "🐳 Démarrage avec Docker..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker n'est pas installé"
            exit 1
        fi
        docker-compose up
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac
