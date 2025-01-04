import { CONFIG } from './config.js';
export class ObjectDetector {
    constructor(camera) {
        this.camera = camera;
        this.model = null;
        this.lastDetectionTime = 0;
    }

    async loadModel() {
        try {
            this.model = await cocoSsd.load();
        } catch (error) {
            throw new Error(`Erreur de chargement du modèle: ${error.message}`);
        }
    }

    async detect() {
        const now = Date.now();
        if (now - this.lastDetectionTime < 1000 / CONFIG.detection.fps) {
            return;
        }
        
        try {
            const predictions = await this.model.detect(this.camera.getVideoElement());
            this.lastDetectionTime = now;
            return predictions.filter(p => p.score > CONFIG.detection.confidence);
        } catch (error) {
            console.error('Erreur de détection:', error);
            return [];
        }
    }

    drawPredictions(predictions) {
        const ctx = this.camera.getContext();
        const canvas = this.camera.getCanvas();

        // Effacer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;

            // Rectangle
            ctx.strokeStyle = CONFIG.detection.boxColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Label
            const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
            ctx.fillStyle = CONFIG.detection.boxColor;
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(x, y - 30, textWidth + 10, 30);
            
            ctx.fillStyle = CONFIG.detection.textColor;
            ctx.font = `${CONFIG.detection.fontSize} ${CONFIG.detection.fontFamily}`;
            ctx.fillText(label, x + 5, y - 10);
        });
    }
}