import { CONFIG } from '../../services/config';

export class Camera {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Dimensions par défaut
    this.canvas.width = 1280;  // Valeur par défaut
    this.canvas.height = 720;  // Valeur par défaut
  }

  async setup() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: CONFIG.camera.video,
      });
      this.video.srcObject = stream;

      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          // Mettre à jour les dimensions du canvas après le chargement de la vidéo
          requestAnimationFrame(() => {
            this.canvas.width = this.video.videoWidth || 1280;
            this.canvas.height = this.video.videoHeight || 720;
            this.ctx = this.canvas.getContext('2d');
            resolve();
          });
        };
        
        // Démarrer la lecture de la vidéo
        this.video.play().catch(console.error);
      });
    } catch (error) {
      throw new Error(`Erreur d'accès à la caméra: ${error.message}`);
    }
  }

  getVideoElement() {
    return this.video;
  }

  getContext() {
    return this.ctx;
  }

  getCanvas() {
    return this.canvas;
  }

  // Ajouter une méthode pour vérifier si le canvas est prêt
  isCanvasReady() {
    return this.canvas.width > 0 && this.canvas.height > 0;
  }
}