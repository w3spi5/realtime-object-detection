import './styles/main.css';
import { Camera } from './components/Camera/Camera';
import { ObjectDetector } from './services/detection';
import { CONFIG } from './services/config';

class App {
    constructor() {
        this.status = document.getElementById('status');
        this.camera = new Camera();
        this.detector = new ObjectDetector(this.camera);
    }

    setStatus(message, isError = false) {
        this.status.textContent = message;
        this.status.classList.toggle('error', isError);
    }

    async init() {
        try {
            this.setStatus('Initialisation de la caméra...');
            await this.camera.setup();

            this.setStatus('Chargement du modèle...');
            await this.detector.loadModel();

            this.setStatus('Prêt !');
            this.startDetection();
        } catch (error) {
            this.setStatus(error.message, true);
            console.error('Erreur d\'initialisation:', error);
        }
    }

    async startDetection() {
        const detect = async () => {
            const predictions = await this.detector.detect();
            if (predictions) {
                this.detector.drawPredictions(predictions);
            }
            requestAnimationFrame(detect);
        };

        detect();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});