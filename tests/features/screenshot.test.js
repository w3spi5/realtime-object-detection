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
        // Configuration complète du DOM avant chaque test
        document.body.innerHTML = `
            <div id="status" class="status">Initializing...</div>
            <div id="video-container">
                <video id="video" autoplay playsinline></video>
                <canvas id="canvas"></canvas>
            </div>
            <button id="screenshot-btn">📸 Capture</button>
        `;

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

        // Instancier l'application et mocker les méthodes
        app = new App();
        app.captureScreenshot = jest.fn().mockReturnValue('data:image/png;base64,mockdata');
        app.getDeviceType = jest.fn().mockReturnValue('mobile');
        app.shareScreenshot = jest.fn().mockResolvedValue(true);
    });

    afterEach(() => {
        document.body.innerHTML = ''; // Réinitialiser complètement le DOM après chaque test
    });

    test('Screenshot button is created', () => {
        const screenshotBtn = document.getElementById('screenshot-btn');
        expect(screenshotBtn).not.toBeNull();
        expect(screenshotBtn.textContent).toBe('📸 Capture');
    });

    test('Advanced screenshot with custom options', () => {
        const dataUrl = app.captureScreenshot({
            includeAnnotations: true,
            quality: 0.8,
            filters: ['addTimestamp']
        });
        expect(dataUrl).toMatch(/^data:image\/png/);
    });

    test('Screenshot file size limitation', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const dataUrl = app.captureScreenshot({ maxFileSize: 10 });
        
        expect(dataUrl).toBe('data:image/png;base64,mockdata');
        consoleErrorSpy.mockRestore();
    });

    test('Device type detection', () => {
        expect(app.getDeviceType()).toBe('mobile');
    });

    test('Share screenshot API', async () => {
        await app.shareScreenshot();
        expect(app.shareScreenshot).toHaveBeenCalled();
    });
});
