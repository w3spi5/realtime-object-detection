export class PerformanceManager {
  constructor() {
    this.metrics = {
      fps: [],
      processingTimes: [],
      memoryUsage: [],
      batteryLevel: null,
    };

    this.thresholds = {
      targetFPS: 30,
      minFPS: 15,
      maxProcessingTime: 100,
      maxMemoryUsage: 0.8,
    };

    this.adaptiveSettings = {
      resolution: 1,
      quality: 1,
      skipFrames: 0,
    };

    this.setupMonitoring();
  }

  async setupMonitoring() {
    // Monitor FPS
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    // Monitor battery if available
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      this.batteryMonitoring(battery);
    }

    // Monitor device capabilities
    this.detectDeviceCapabilities();
  }

  batteryMonitoring(battery) {
    this.metrics.batteryLevel = battery.level;

    battery.addEventListener('levelchange', () => {
      this.metrics.batteryLevel = battery.level;
      this.adjustForBattery();
    });
  }

  detectDeviceCapabilities() {
    // Detect hardware concurrency
    this.metrics.cores = navigator.hardwareConcurrency || 4;

    // Detect device memory
    this.metrics.deviceMemory = navigator.deviceMemory || 4;

    // Detect connection type
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.adjustForNetwork();
      });
    }

    // Initial adjustment based on device capabilities
    this.adjustForDeviceCapabilities();
  }

  updateMetrics(processingTime) {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Update FPS metrics
    const currentFPS = 1000 / frameTime;
    this.metrics.fps.push(currentFPS);
    if (this.metrics.fps.length > 60) this.metrics.fps.shift();

    // Update processing time metrics
    this.metrics.processingTimes.push(processingTime);
    if (this.metrics.processingTimes.length > 60) this.metrics.processingTimes.shift();

    // Monitor memory if available
    if ('performance' in window && 'memory' in window.performance) {
      const memory = window.performance.memory;
      this.metrics.memoryUsage.push(memory.usedJSHeapSize / memory.jsHeapSizeLimit);
      if (this.metrics.memoryUsage.length > 60) this.metrics.memoryUsage.shift();
    }

    // Analyze metrics and adjust settings
    this.analyzeAndAdjust();
  }

  analyzeAndAdjust() {
    // Calculate average metrics
    const avgFPS = this.average(this.metrics.fps);
    const avgProcessingTime = this.average(this.metrics.processingTimes);
    const avgMemoryUsage = this.average(this.metrics.memoryUsage);

    // Adjust resolution
    if (avgFPS < this.thresholds.minFPS || avgProcessingTime > this.thresholds.maxProcessingTime) {
      this.adaptiveSettings.resolution = Math.max(0.5, this.adaptiveSettings.resolution - 0.1);
    } else if (avgFPS > this.thresholds.targetFPS + 5) {
      this.adaptiveSettings.resolution = Math.min(1, this.adaptiveSettings.resolution + 0.1);
    }

    // Adjust quality
    if (avgMemoryUsage > this.thresholds.maxMemoryUsage) {
      this.adaptiveSettings.quality = Math.max(0.6, this.adaptiveSettings.quality - 0.1);
    }

    // Adjust frame skipping
    this.adaptiveSettings.skipFrames = this.calculateOptimalSkipFrames(avgFPS);
  }

  calculateOptimalSkipFrames(currentFPS) {
    if (currentFPS < 10) return 3;
    if (currentFPS < 20) return 2;
    if (currentFPS < 25) return 1;
    return 0;
  }

  adjustForBattery() {
    if (this.metrics.batteryLevel < 0.2) {
      // Power saving mode
      this.adaptiveSettings.resolution = 0.7;
      this.adaptiveSettings.quality = 0.8;
      this.thresholds.targetFPS = 20;
    } else {
      // Normal mode
      this.thresholds.targetFPS = 30;
    }
  }

  adjustForNetwork() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.saveData) {
        // Data saver mode
        this.adaptiveSettings.quality = 0.7;
      }
    }
  }

  adjustForDeviceCapabilities() {
    if (this.metrics.deviceMemory < 4) {
      // Low memory device
      this.adaptiveSettings.resolution = 0.8;
      this.adaptiveSettings.quality = 0.8;
    }

    if (this.metrics.cores < 4) {
      // Low CPU device
      this.thresholds.targetFPS = 20;
    }
  }

  getOptimalSettings() {
    return {
      ...this.adaptiveSettings,
      targetFPS: this.thresholds.targetFPS,
    };
  }

  average(array) {
    return array.reduce((a, b) => a + b, 0) / array.length;
  }

  getPerformanceReport() {
    return {
      currentSettings: this.adaptiveSettings,
      metrics: {
        averageFPS: this.average(this.metrics.fps),
        averageProcessingTime: this.average(this.metrics.processingTimes),
        memoryUsage: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1],
        batteryLevel: this.metrics.batteryLevel,
      },
      deviceInfo: {
        cores: this.metrics.cores,
        memory: this.metrics.deviceMemory,
      },
    };
  }
}
