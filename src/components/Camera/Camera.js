import { CONFIG } from '../../services/config';

export class Camera {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async setup() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: CONFIG.camera.video
            });
            this.video.srcObject = stream;

            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    resolve();
                };
            });
        } catch (error) {
            throw new Error(`Erreur d'accès à la caméra: ${error.message}`);
        }
    }

    getVideoElement() {
        return this.video;
    }

    getContext() {
        return this.ctx;
    }

    getCanvas() {
        return this.canvas;
    }
}