import { Camera } from './js/camera.js';
import { ObjectDetector } from './js/detection.js';
import './app.css';

class App {
    constructor() {
        this.statusElement = document.getElementById('status');
        this.camera = new Camera();
        this.detector = new ObjectDetector(this.camera);
        this.isRunning = false;
    }

    async initialize() {
        try {
            this.updateStatus('Initialisation de la caméra...');
            await this.camera.setup();

            this.updateStatus('Chargement du modèle...');
            await this.detector.loadModel();

            this.updateStatus('Prêt !');
            this.startDetection();
        } catch (error) {
            this.updateStatus(`Erreur: ${error.message}`, true);
            console.error(error);
        }
    }

    updateStatus(message, isError = false) {
        this.statusElement.textContent = message;
        this.statusElement.className = isError ? 'status error' : 'status';
    }

    async startDetection() {
        if (this.isRunning) return;
        this.isRunning = true;

        const detectFrame = async () => {
            if (!this.isRunning) return;

            try {
                const predictions = await this.detector.detect();
                this.detector.drawPredictions(predictions);
            } catch (error) {
                console.error('Erreur de détection:', error);
            }

            requestAnimationFrame(detectFrame);
        };

        detectFrame();
    }

    stopDetection() {
        this.isRunning = false;
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});
