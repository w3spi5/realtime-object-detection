import { CONFIG } from './config.js';

export class ObjectDetector {
  constructor(camera) {
    this.camera = camera;
    this.model = null;
    this.lastDetectionTime = 0;
    this.frameCount = 0;
    this.skipFrames = 0;
    this.fpsBuffer = [];
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false });
    this.labelCache = new Map();

    // Initialize performance monitoring
    this.performanceMonitor = {
      lastFPSUpdate: 0,
      framesSinceLastUpdate: 0,
      averageFPS: 0,
    };
  }

  async loadModel() {
    try {
      this.model = await cocoSsd.load({
        base: 'lite', // Use lite model for better performance
        modelUrl: CONFIG.detection.modelUrl, // Optional custom model URL
      });

      // Initialize offscreen canvas dimensions
      const canvas = this.camera.getCanvas();
      this.offscreenCanvas.width = canvas.width;
      this.offscreenCanvas.height = canvas.height;
    } catch (error) {
      throw new Error(`Erreur de chargement du modèle: ${error.message}`);
    }
  }

  updatePerformanceMetrics() {
    const now = performance.now();
    this.performanceMonitor.framesSinceLastUpdate++;

    if (now - this.performanceMonitor.lastFPSUpdate >= 1000) {
      this.performanceMonitor.averageFPS =
        (this.performanceMonitor.framesSinceLastUpdate * 1000) /
        (now - this.performanceMonitor.lastFPSUpdate);

      // Adjust skip frames based on performance
      this.adjustSkipFrames(this.performanceMonitor.averageFPS);

      this.performanceMonitor.framesSinceLastUpdate = 0;
      this.performanceMonitor.lastFPSUpdate = now;
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

  async detect() {
    try {
      // Optimize input resolution based on device capabilities
      const video = this.camera.getVideoElement();
      const scaleFactor = this.determineOptimalScale();
      let inputElement = video;

      if (scaleFactor !== 1) {
        this.offscreenCtx.drawImage(
          video,
          0,
          0,
          video.videoWidth,
          video.videoHeight,
          0,
          0,
          video.videoWidth * scaleFactor,
          video.videoHeight * scaleFactor
        );
        inputElement = this.offscreenCanvas;
      }

      const predictions = await this.model.detect(inputElement);
      const now = Date.now();
      this.lastDetectionTime = now;
      this.lastPredictions = predictions.filter((p) => p.score > CONFIG.detection.confidence);
      return this.lastPredictions;
    } catch (error) {
      console.error('Erreur de détection:', error);
      return [];
    }
  }

  determineOptimalScale() {
    const fps = this.performanceMonitor.averageFPS;
    if (fps < 15) return 0.5;
    if (fps < 25) return 0.75;
    return 1;
  }

  getLabelCache(text, width) {
    const key = `${text}-${width}`;
    if (!this.labelCache.has(key)) {
      this.labelCache.set(key, {
        text,
        width,
        timestamp: Date.now(),
      });
    }
    return this.labelCache.get(key);
  }

  drawPredictions(predictions) {
    const ctx = this.camera.getContext();
    const canvas = this.camera.getCanvas();

    // Utiliser le canvas offscreen pour le double buffering
    this.offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styles once
    this.offscreenCtx.strokeStyle = CONFIG.detection.boxColor;
    this.offscreenCtx.lineWidth = 2;
    this.offscreenCtx.font = `${CONFIG.detection.fontSize} ${CONFIG.detection.fontFamily}`;

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      // Draw bounding box
      this.offscreenCtx.strokeRect(x, y, width, height);

      // Draw label with caching
      const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
      const cached = this.getLabelCache(label, width);

      this.offscreenCtx.fillStyle = CONFIG.detection.boxColor;
      this.offscreenCtx.fillRect(x, y - 30, cached.width + 10, 30);

      this.offscreenCtx.fillStyle = CONFIG.detection.textColor;
      this.offscreenCtx.fillText(label, x + 5, y - 10);
    });

    // Copy offscreen canvas to main canvas in one operation
    ctx.drawImage(this.offscreenCanvas, 0, 0);

    // Clean up old cache entries
    this.cleanLabelCache();
  }

  cleanLabelCache() {
    const now = Date.now();
    for (const [key, value] of this.labelCache) {
      if (now - value.timestamp > 30000) {
        // Clear entries older than 30 seconds
        this.labelCache.delete(key);
      }
    }
  }
}
