/**
 * @jest-environment jsdom
 */
import { App } from '../../src/app.js';

describe('Advanced Screenshot Functionality', () => {
  let app;
  let mockCamera;
  let mockCanvas;
  let mockVideo;

  beforeEach(() => {
    // Nettoyer et configurer complètement le DOM
    document.body.innerHTML = `
      <div id="status" class="status">
        Initializing...
      </div>
      <div id="video-container">
        <video id="video" autoplay playsinline></video>
        <canvas id="canvas"></canvas>
      </div>
    `;

    // Créer manuellement le conteneur de capture d'écran
    const screenshotContainer = document.createElement('div');
    screenshotContainer.id = 'screenshot-container';
    document.getElementById('status').appendChild(screenshotContainer);

    // Créer des mocks pour la caméra et le canvas
    mockVideo = document.getElementById('video');
    Object.defineProperties(mockVideo, {
      videoWidth: { value: 1280, writable: true },
      videoHeight: { value: 720, writable: true }
    });

    mockCanvas = document.getElementById('canvas');
    
    mockCamera = {
      getCanvas: jest.fn().mockReturnValue(mockCanvas),
      getVideoElement: jest.fn().mockReturnValue(mockVideo),
      getContext: jest.fn().mockReturnValue(mockCanvas.getContext('2d'))
    };

    // Espionner les méthodes globales
    global.URL.createObjectURL = jest.fn();
    global.URL.revokeObjectURL = jest.fn();
    global.atob = jest.fn().mockReturnValue('mock data');
  });

  test('Screenshot button is created', () => {
    app = new App();
    const screenshotBtn = document.getElementById('screenshot-btn');
    
    expect(screenshotBtn).not.toBeNull();
    expect(screenshotBtn.textContent).toBe('📸 Capture');
  });

  test('Advanced screenshot with custom options', () => {
    app = new App();
    app.camera = mockCamera;

    // Mock du détecteur pour simuler des objets
    app.detector = {
      lastPredictions: [
        { class: 'person', score: 0.85 },
        { class: 'chair', score: 0.72 }
      ]
    };

    const screenshotSpy = jest.spyOn(app, 'captureScreenshot');
    const dataUrl = app.captureScreenshot({
      includeAnnotations: true,
      quality: 0.8,
      filters: ['addTimestamp']
    });

    expect(screenshotSpy).toHaveBeenCalledWith({
      includeAnnotations: true,
      quality: 0.8,
      filters: ['addTimestamp']
    });
    expect(dataUrl).toMatch(/^data:image\/png/);
  });

  test('Screenshot file size limitation', () => {
    app = new App();
    app.camera = mockCamera;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const updateStatusSpy = jest.spyOn(app, 'updateStatus');

    // Simuler une limite de taille de fichier très petite pour déclencher une erreur
    const dataUrl = app.captureScreenshot({
      maxFileSize: 10
    });

    expect(dataUrl).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(updateStatusSpy).toHaveBeenCalledWith(
      'Screenshot too large. Try lower quality.',
      true
    );

    consoleErrorSpy.mockRestore();
    updateStatusSpy.mockRestore();
  });

  test('Device type detection', () => {
    app = new App();

    const testCases = [
      { 
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
        expectedType: 'mobile'
      },
      { 
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X)',
        expectedType: 'tablet'
      },
      { 
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        expectedType: 'desktop'
      }
    ];

    testCases.forEach(({ userAgent, expectedType }) => {
      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true
      });

      expect(app.getDeviceType()).toBe(expectedType);
    });
  });

  test('Share screenshot API', async () => {
    app = new App();
    app.camera = mockCamera;

    // Mock de navigator.share
    const mockShare = jest.fn().mockResolvedValue(true);
    global.navigator.share = mockShare;

    await app.shareScreenshot();

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Object Detection Screenshot',
      files: expect.any(Array)
    });
  });
});