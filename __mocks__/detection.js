import { CONFIG } from '../config.js';

export class ObjectDetector {
  constructor(camera) {
    this.camera = camera;
    this.skipFrames = 0;
    this.performanceMonitor = {
      lastFPSUpdate: 0,
      framesSinceLastUpdate: 0,
      averageFPS: 30
    };

    // Création conditionnelle du canvas hors écran
    if (typeof document !== 'undefined') {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }
  }

  adjustSkipFrames(currentFPS) {
    const targetFPS = CONFIG.detection.targetFPS || 30;
    if (currentFPS < targetFPS - 5) {
      this.skipFrames = Math.min(this.skipFrames + 1, 4);
    } else if (currentFPS > targetFPS + 5 && this.skipFrames > 0) {
      this.skipFrames = Math.max(this.skipFrames - 1, 0);
    }
  }

  determineOptimalScale() {
    const fps = this.performanceMonitor.averageFPS;
    if (fps < 15) return 0.5;
    if (fps < 25) return 0.75;
    return 1;
  }
}