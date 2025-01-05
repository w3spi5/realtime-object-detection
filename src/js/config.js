export const CONFIG = {
  camera: {
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  },
  detection: {
    confidence: 0.6,
    fps: 30,
    targetFPS: 30,
    boxColor: '#2196f3',
    textColor: 'white',
    fontSize: '16px',
    fontFamily: 'Arial',
    modelUrl: undefined, // Optional custom model URL
    performance: {
      maxSkipFrames: 4,
      adaptiveResolution: true,
      cacheTimeout: 30000,
      fpsUpdateInterval: 1000,
    },
  },
};
