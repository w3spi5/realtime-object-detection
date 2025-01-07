import { ObjectDetector } from '../../src/js/detection';
import { ResourceManager } from '../../src/components/Performances/ResourceManager';
import { PerformanceManager } from '../../src/components/Performances/PerformanceManager';

const mockCamera = {
  getVideoElement: () => ({
    videoWidth: 1280,
    videoHeight: 720,
    play: jest.fn(),
  }),
  getCanvas: () => ({
    width: 1280,
    height: 720,
    getContext: () => ({
      drawImage: jest.fn(),
      clearRect: jest.fn(),
    }),
  }),
  getContext: () => ({
    drawImage: jest.fn(),
    clearRect: jest.fn(),
  })
};

jest.mock('../../src/js/camera', () => ({
  Camera: jest.fn().mockImplementation(() => mockCamera),
}));

describe('Performance Unit Tests', () => {
  describe('ObjectDetector', () => {
    let detector;

    beforeEach(() => {
      detector = new ObjectDetector(mockCamera);
      detector.performanceMonitor = {
        lastFPSUpdate: 0,
        framesSinceLastUpdate: 0,
        averageFPS: 30,
      };
    });

    test('should adjust skip frames when FPS is below target', () => {
      const initialSkipFrames = detector.skipFrames;
      detector.adjustSkipFrames(15);
      expect(detector.skipFrames).toBeGreaterThan(initialSkipFrames);
    });

    test('should decrease skip frames when FPS is above target', () => {
      detector.skipFrames = 2;
      detector.adjustSkipFrames(40);
      expect(detector.skipFrames).toBeLessThan(2);
    });

    test('should determine correct scale based on FPS', () => {
      detector.performanceMonitor.averageFPS = 10;
      expect(detector.determineOptimalScale()).toBe(0.5);

      detector.performanceMonitor.averageFPS = 20;
      expect(detector.determineOptimalScale()).toBe(0.75);

      detector.performanceMonitor.averageFPS = 30;
      expect(detector.determineOptimalScale()).toBe(1);
    });
  });

  describe('ResourceManager', () => {
    let resourceManager;

    beforeEach(() => {
      resourceManager = new ResourceManager();
      Object.defineProperty(window.performance, 'memory', {
        value: {
          usedJSHeapSize: 50 * 1024 * 1024,
          jsHeapSizeLimit: 100 * 1024 * 1024,
        },
        configurable: true,
      });
    });

    test('should track resources', () => {
      const testBuffer = new Uint8Array(1024);
      resourceManager.registerResource('test', testBuffer, 'buffer');

      const resource = resourceManager.getResource('test');
      expect(resource).toBe(testBuffer);
    });

    test('should release resources', () => {
      const testBuffer = new Uint8Array(1024);
      resourceManager.registerResource('test', testBuffer, 'buffer');

      expect(resourceManager.releaseResource('test')).toBe(true);
      expect(resourceManager.getResource('test')).toBeNull();
    });
  });

  describe('PerformanceManager', () => {
    let perfManager;

    beforeEach(() => {
      perfManager = new PerformanceManager();
    });

    test('should provide default settings', () => {
      const settings = perfManager.getOptimalSettings();
      expect(settings.resolution).toBe(1);
      expect(settings.quality).toBe(1);
      expect(settings.targetFPS).toBe(30);
    });

    test('should adapt settings based on metrics', () => {
      perfManager.updateMetrics(50); // 50ms processing time
      const settings = perfManager.getOptimalSettings();
      expect(settings.resolution).toBeLessThanOrEqual(1);
    });
  });
});
