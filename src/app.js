import { Camera } from './js/camera.js';
import { ObjectDetector } from './js/detection.js';
import { ResourceManager } from './components/Performances/ResourceManager.js';
import { PerformanceManager } from './components/Performances/PerformanceManager.js';
import './app.css';

class App {
  constructor() {
    this.statusElement = document.getElementById('status');
    this.camera = new Camera();
    this.detector = null;
    this.isRunning = false;

    // Lier les méthodes au contexte de la classe
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.initialize = this.initialize.bind(this);
    
    // Initialiser les gestionnaires
    this.resourceManager = new ResourceManager();
    this.performanceManager = new PerformanceManager();
  }

  updateStatus(message, isError = false) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
      this.statusElement.style.color = isError ? 'red' : 'black';
    }
  }

  async initialize() {
    try {
      // S'assurer que la caméra est initialisée
      await this.camera.setup();
      
      // Initialiser le détecteur après la caméra
      this.detector = new ObjectDetector(this.camera);
      await this.detector.loadModel();
      
      // Ajouter le bouton de capture
      this.createScreenshotButton();
      
      this.isRunning = true;
      this.updateStatus('Prêt à détecter');
      
      // Démarrer la boucle de détection
      this.detectionLoop();
      
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      this.updateStatus(`Erreur: ${error.message}`, true);
    }
  }

  createScreenshotButton() {
    const button = document.createElement('button');
    button.textContent = '📸 Capture';
    button.className = 'screenshot-btn';
    button.addEventListener('click', () => this.captureScreenshot());
    this.statusElement.appendChild(button);
  }

  async captureScreenshot(options = {}) {
    try {
      const video = this.camera.getVideoElement();
      if (!video || !video.videoWidth) {
        throw new Error('No video available');
      }
      
      // ... reste du code de capture ...
      
    } catch (error) {
      console.error('Screenshot capture error:', error);
      this.updateStatus('Erreur lors de la capture', true);
    }
  }

  async detectionLoop() {
    if (!this.isRunning) return;

    if (this.detector) {
      try {
        const predictions = await this.detector.detect();
        if (predictions) {
          this.detector.drawPredictions(predictions);
        }
      } catch (error) {
        console.error('Erreur de détection:', error);
      }
    }

    requestAnimationFrame(() => this.detectionLoop());
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.isRunning = false;
    } else {
      this.isRunning = true;
      this.detectionLoop();
    }
  }

  cleanup() {
    this.isRunning = false;
    // Nettoyage des ressources
    if (this.camera) {
      const stream = this.camera.getVideoElement().srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();

  // Gestion de la visibilité de la page
  document.addEventListener('visibilitychange', app.handleVisibilityChange);
  
  // Nettoyage lors de la fermeture
  window.addEventListener('unload', () => {
    app.cleanup();
  });
});

export { App };