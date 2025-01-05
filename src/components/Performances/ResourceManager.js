export class ResourceManager {
  constructor() {
    this.resources = new Map();
    this.memoryUsage = {
      total: 0,
      limit: 50 * 1024 * 1024, // 50MB default limit
      critical: false,
    };

    this.setupMemoryMonitoring();
  }

  setupMemoryMonitoring() {
    if ('performance' in window && 'memory' in window.performance) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 5000);
    }
  }

  checkMemoryUsage() {
    if ('performance' in window && 'memory' in window.performance) {
      const memory = window.performance.memory;
      this.memoryUsage.total = memory.usedJSHeapSize;
      this.memoryUsage.critical = memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8;

      if (this.memoryUsage.critical) {
        this.releaseUnusedResources();
      }
    }
  }

  registerResource(key, resource, type = 'generic') {
    this.resources.set(key, {
      resource,
      type,
      lastUsed: Date.now(),
      useCount: 0,
    });
  }

  getResource(key) {
    const resource = this.resources.get(key);
    if (resource) {
      resource.lastUsed = Date.now();
      resource.useCount++;
      return resource.resource;
    }
    return null;
  }

  releaseResource(key) {
    const resource = this.resources.get(key);
    if (resource) {
      // Cleanup based on resource type
      switch (resource.type) {
        case 'canvas':
          resource.resource.width = 0;
          resource.resource.height = 0;
          break;
        case 'buffer':
          if (resource.resource instanceof ArrayBuffer) {
            resource.resource = null;
          }
          break;
        case 'image':
          resource.resource.src = '';
          break;
      }
      this.resources.delete(key);
      return true;
    }
    return false;
  }

  releaseUnusedResources() {
    const now = Date.now();
    const unusedThreshold = 30000; // 30 seconds

    for (const [key, resource] of this.resources) {
      if (now - resource.lastUsed > unusedThreshold && resource.useCount < 5) {
        this.releaseResource(key);
      }
    }
  }

  optimizeMemoryUsage() {
    if (this.memoryUsage.critical) {
      // Aggressive optimization
      this.releaseUnusedResources();
      this.compactArrayBuffers();
      this.clearImageCache();
    }
  }

  compactArrayBuffers() {
    for (const [key, resource] of this.resources) {
      if (resource.type === 'buffer' && resource.resource instanceof ArrayBuffer) {
        // Create a compact copy if the buffer is partially used
        const view = new Uint8Array(resource.resource);
        const usedLength = view.findIndex((byte) => byte === 0);
        if (usedLength > 0 && usedLength < resource.resource.byteLength) {
          const compactBuffer = resource.resource.slice(0, usedLength);
          this.resources.set(key, {
            ...resource,
            resource: compactBuffer,
          });
        }
      }
    }
  }

  clearImageCache() {
    for (const [key, resource] of this.resources) {
      if (resource.type === 'image' && !this.isImageActive(resource)) {
        this.releaseResource(key);
      }
    }
  }

  isImageActive(resource) {
    return Date.now() - resource.lastUsed < 5000 || resource.useCount > 10;
  }

  // Stats and monitoring
  getResourceStats() {
    return {
      totalResources: this.resources.size,
      memoryUsage: this.memoryUsage,
      resourceTypes: Array.from(this.resources.values()).reduce((acc, res) => {
        acc[res.type] = (acc[res.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}
