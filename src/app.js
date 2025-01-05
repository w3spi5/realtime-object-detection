import { Camera } from './js/camera.js';
import { ObjectDetector } from './js/detection.js';
import { ResourceManager } from './components/Performances/ResourceManager.js';
import { PerformanceManager } from './components/Performances/PerformanceManager.js';
import './app.css';

class App {
  constructor() {
    this.statusElement = document.getElementById('status');
    this.camera = new Camera();
    this.detector = new ObjectDetector(this.camera);
    this.isRunning = false;

    // Initialize managers
    this.resourceManager = new ResourceManager();
    this.performanceManager = new PerformanceManager();

    // Setup detection worker
    this.setupDetectionWorker();

    // Bind methods
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  setupDetectionWorker() {
    this.detectionWorker = new Worker(
      new URL('./components/Performances/detection.worker.js', import.meta.url),
      { type: 'module' }
    );

    this.detectionWorker.onmessage = (e) => {
      const { type, data } = e.data;
      switch (type) {
        case 'MODEL_LOADED':
          this.updateStatus('Modèle chargé !');
          break;
        case 'PREDICTIONS':
          this.detector.drawPredictions(data);
          break;
        case 'ERROR':
          this.updateStatus(`Erreur: ${data.message}`, true);
          console.error(data.error);
          break;
      }
    };
  }

  async initialize() {
    try {
      // Register event listeners
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('resize', this.handleResize);

      this.updateStatus('Initialisation de la caméra...');
      await this.camera.setup();

      // Register camera resources
      this.resourceManager.registerResource('camera-video', this.camera.getVideoElement(), 'video');
      this.resourceManager.registerResource('camera-canvas', this.camera.getCanvas(), 'canvas');

      this.updateStatus('Chargement du modèle...');
      // Load model in worker
      this.detectionWorker.postMessage({
        type: 'LOAD_MODEL',
        data: { modelConfig: CONFIG.detection },
      });

      this.updateStatus('Prêt !');
      await this.startDetection();
    } catch (error) {
      this.updateStatus(`Erreur: ${error.message}`, true);
      console.error("Erreur d'initialisation:", error);
    }
  }

  updateStatus(message, isError = false) {
    this.statusElement.textContent = message;
    this.statusElement.className = isError ? 'status error' : 'status';
  }

  async startDetection() {
    if (this.isRunning) return;
    this.isRunning = true;

    const processFrame = async () => {
      if (!this.isRunning) return;

      try {
        // Get optimal settings from performance manager
        const settings = this.performanceManager.getOptimalSettings();

        // Start performance measurement
        const startTime = performance.now();

        // Prepare frame data
        const canvas = this.camera.getCanvas();
        const context = canvas.getContext('2d');
        const video = this.camera.getVideoElement();

        // Apply resolution scaling if needed
        const scaledWidth = video.videoWidth * settings.resolution;
        const scaledHeight = video.videoHeight * settings.resolution;

        context.drawImage(
          video,
          0,
          0,
          video.videoWidth,
          video.videoHeight,
          0,
          0,
          scaledWidth,
          scaledHeight
        );

        // Get frame data for processing
        const imageData = context.getImageData(0, 0, scaledWidth, scaledHeight);

        // Send frame to worker for processing
        this.detectionWorker.postMessage(
          {
            type: 'PROCESS_FRAME',
            data: {
              imageData,
              settings,
            },
          },
          [imageData.data.buffer]
        ); // Transfer buffer ownership to worker

        // Update performance metrics
        const processingTime = performance.now() - startTime;
        this.performanceManager.updateMetrics(processingTime);

        // Check resource usage and optimize if needed
        this.resourceManager.optimizeMemoryUsage();
      } catch (error) {
        console.error('Erreur de traitement:', error);
      }

      // Schedule next frame based on performance settings
      const frameDelay = 1000 / this.performanceManager.getOptimalSettings().targetFPS;
      setTimeout(() => {
        requestAnimationFrame(processFrame);
      }, frameDelay);
    };

    processFrame();
  }

  stopDetection() {
    this.isRunning = false;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.stopDetection();
    } else {
      this.startDetection();
    }
  }

  handleResize() {
    // Debounce resize handling
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      const canvas = this.camera.getCanvas();
      const video = this.camera.getVideoElement();

      // Update canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Force performance manager to recalculate optimal settings
      this.performanceManager.adjustForDeviceCapabilities();
    }, 250);
  }

  cleanup() {
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('resize', this.handleResize);

    // Stop detection
    this.stopDetection();

    // Terminate worker
    if (this.detectionWorker) {
      this.detectionWorker.terminate();
    }

    // Release resources
    this.resourceManager.releaseUnusedResources();
  }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();

  // Cleanup on page unload
  window.addEventListener('unload', () => {
    app.cleanup();
  });
});
