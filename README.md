# Application de Détection d'Objets en Temps Réel

Une application web progressive qui permet la détection d'objets en temps réel via la caméra de votre smartphone, en utilisant TensorFlow.js et le modèle COCO-SSD.

## Caractéristiques

- Détection d'objets en temps réel via la caméra du smartphone
- Support de multiples navigateurs (Safari, Chrome, Firefox)
- Interface responsive et intuitive
- Mode plein écran pour une meilleure expérience
- Gestion optimisée des performances
- Support hors ligne (PWA)

## Prérequis

- Un smartphone avec une caméra
- Un navigateur web moderne supportant WebRTC
- Une connexion HTTPS (requis pour l'accès à la caméra)

## Installation

1. Clonez le repository
   ```bash
   git clone https://github.com/w3spi5/realtime-object-detection.git
   cd realtime-object-detection
   ```

2. Installez les dépendances
   ```bash
   npm install
   ```

3. Démarrez le serveur de développement
   ```bash
   npm start
   ```

## Déploiement

1. Construisez l'application
   ```bash
   npm run build
   ```

2. Déployez le contenu du dossier `dist` sur un serveur HTTPS

## Architecture du Projet

- `src/` - Code source de l'application
- `public/` - Assets statiques
- `dist/` - Build de production
- `tests/` - Tests unitaires et d'intégration

## Workflow de Développement

- Branche `main` : version stable de production
- Branche `develop` : développement continu
- Branches `feature/*` : nouvelles fonctionnalités
- Branches `fix/*` : corrections de bugs

## Contribution

1. Forkez le projet
2. Créez une branche depuis `develop`
   ```bash
   git checkout -b feature/ma-fonctionnalite develop
   ```
3. Développez votre fonctionnalité
4. Assurez-vous que les tests passent
   ```bash
   npm run test
   ```
5. Soumettez une Pull Request vers `develop`

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
