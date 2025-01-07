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

    // Ajouter le bouton de capture
    this.createScreenshotButton();

    // Initialiser les gestionnaires
    this.resourceManager = new ResourceManager();
    this.performanceManager = new PerformanceManager();

    // Configuration du worker de détection
    this.setupDetectionWorker();

    // Lier les méthodes
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  createScreenshotButton() {
    const statusElement = document.getElementById('status');
    
    // S'assurer que statusElement existe avant de continuer
    if (!statusElement) {
      console.warn('Status element not found');
      return;
    }

    let screenshotContainer = document.getElementById('screenshot-container');

    // Si le conteneur n'existe pas, le créer
    if (!screenshotContainer) {
      screenshotContainer = document.createElement('div');
      screenshotContainer.id = 'screenshot-container';
      statusElement.appendChild(screenshotContainer);
    }

    const screenshotButton = document.createElement('button');
    screenshotButton.id = 'screenshot-btn';
    screenshotButton.textContent = '📸 Capture';
    screenshotButton.classList.add('screenshot-btn');
    screenshotButton.addEventListener('click', () => this.captureScreenshot());

    // Ajouter le bouton au conteneur
    screenshotContainer.appendChild(screenshotButton);
  }

  /**
   * Capture a screenshot with advanced options
   * @param {Object} options - Capture configuration
   * @returns {string} Data URL of the screenshot
   */
  captureScreenshot(options = {}) {
    const defaultOptions = {
      includeAnnotations: true,
      quality: 0.9,
      format: 'png',
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      filters: []
    };
    
    const settings = { ...defaultOptions, ...options };

    try {
      const video = this.camera.getVideoElement();
      const canvas = this.camera.getCanvas();

      if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('No video available');
      }

      const screenshotCanvas = document.createElement('canvas');
      const screenshotCtx = screenshotCanvas.getContext('2d');

      screenshotCanvas.width = canvas.width;
      screenshotCanvas.height = canvas.height;

      // Draw video frame
      screenshotCtx.drawImage(
        video, 
        0, 0, 
        video.videoWidth, 
        video.videoHeight, 
        0, 0, 
        canvas.width, 
        canvas.height
      );

      // Apply filters
      const availableFilters = {
        grayscale: (ctx) => {
          const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);
        },
        addTimestamp: (ctx) => {
          ctx.font = '20px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(new Date().toLocaleString(), 10, 30);
        }
      };

      settings.filters.forEach(filter => {
        if (availableFilters[filter]) {
          availableFilters[filter](screenshotCtx);
        }
      });

      // Overlay detections if enabled
      if (settings.includeAnnotations) {
        screenshotCtx.drawImage(canvas, 0, 0);
      }

      // Generate screenshot
      const dataUrl = screenshotCanvas.toDataURL(`image/${settings.format}`, settings.quality);
      
      // Verify file size
      const byteCharacters = atob(dataUrl.split(',')[1]);
      if (byteCharacters.length > settings.maxFileSize) {
        throw new Error('Screenshot exceeds maximum file size');
      }

      this.downloadScreenshot(dataUrl);
      this.trackScreenshotEvent({ objectCount: this.getDetectedObjectCount() });

      return dataUrl;
    } catch (error) {
      this.handleScreenshotError(error);
      return null;
    }
  }

  /**
   * Download screenshot with a unique filename
   * @param {string} dataUrl - Base64 encoded image
   */
  downloadScreenshot(dataUrl) {
    const generateSafeFilename = () => {
      const date = new Date();
      const timestamp = date.toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '');
      const uniqueId = Math.random().toString(36).substring(2, 7);
      
      return `object-detection_${timestamp}_${uniqueId}.png`;
    };

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = generateSafeFilename();
    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);

    this.updateStatus('Screenshot saved!');
  }

  /**
   * Share screenshot using Web Share API
   */
  async shareScreenshot() {
    try {
      const dataUrl = this.captureScreenshot();
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      
      if (navigator.share) {
        await navigator.share({
          title: 'Object Detection Screenshot',
          files: [
            new File([blob], 'object-detection.png', { type: 'image/png' })
          ]
        });
      } else {
        this.updateStatus('Sharing not supported');
      }
    } catch (error) {
      this.handleScreenshotError(error);
    }
  }

  /**
   * Handle screenshot errors
   * @param {Error} error - Error object
   */
  handleScreenshotError(error) {
    console.error('Screenshot capture error:', error);
    
    const errorMessages = {
      'No video available': 'Unable to capture. Check camera access.',
      'Screenshot exceeds maximum file size': 'Screenshot too large. Try lower quality.',
      'default': 'Screenshot failed. Please try again.'
    };

    const errorMessage = errorMessages[error.message] || errorMessages['default'];
    this.updateStatus(errorMessage, true);

    // System notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Capture Error', { 
        body: errorMessage,
        icon: '/path/to/error-icon.png'
      });
    }
  }

  /**
   * Track screenshot event (placeholder for analytics integration)
   * @param {Object} metadata - Screenshot metadata
   */
  trackScreenshotEvent(metadata) {
    if (window.analytics) {
      window.analytics.track('Screenshot Captured', {
        objectsDetected: metadata.objectCount,
        timestamp: new Date(),
        deviceType: this.getDeviceType()
      });
    }
  }

  /**
   * Get number of currently detected objects
   * @returns {number}
   */
  getDetectedObjectCount() {
    // This would depend on your detection implementation
    return this.detector.lastPredictions ? this.detector.lastPredictions.length : 0;
  }

  /**
   * Detect device type
   * @returns {string}
   */
  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // ... existing methods remain the same
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.initialize();

  // Cleanup on page unload
  window.addEventListener('unload', () => {
    app.cleanup();
  });
});

export { App }; // Named export for testing