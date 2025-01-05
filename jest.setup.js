// Mock pour le canvas
class MockContext2D {
  constructor() {
    this.clearRect = jest.fn();
    this.fillRect = jest.fn();
    this.fillText = jest.fn();
    this.drawImage = jest.fn();
    this.measureText = jest.fn().mockReturnValue({ width: 100 });
    this.getImageData = jest.fn().mockReturnValue({
      data: new Uint8ClampedArray(100 * 100 * 4),
      width: 100,
      height: 100
    });
  }
}

// Mock pour HTMLCanvasElement
class MockCanvas {
  constructor() {
    this.width = 1280;
    this.height = 720;
    this._context = new MockContext2D();
  }

  getContext(contextType) {
    return this._context;
  }

  toDataURL() {
    return 'data:image/png;base64,mock';
  }
}

// Remplacer HTMLCanvasElement global
global.HTMLCanvasElement = MockCanvas;

// Mock createElement pour canvas
document.createElement = jest.fn((tagName) => {
  if (tagName === 'canvas') {
    return new MockCanvas();
  }
  return null;
});

// Mock getElementById pour video et canvas
document.getElementById = jest.fn((id) => {
  if (id === 'video') {
    return {
      videoWidth: 1280,
      videoHeight: 720,
      play: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
      srcObject: null
    };
  }
  if (id === 'canvas') {
    return new MockCanvas();
  }
  return null;
});

// Mock TensorFlow.js COCO-SSD
global.cocoSsd = {
  load: jest.fn().mockResolvedValue({
    detect: jest.fn().mockResolvedValue([])
  })
};

// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({})
};

// Mock performance.now()
if (!global.performance) {
  global.performance = {};
}
global.performance.now = jest.fn(() => Date.now());

// Mock Worker
class MockWorker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
  }
  
  postMessage(msg) {
    if (this.onmessage) {
      this.onmessage({ data: { type: 'MOCK_RESPONSE', data: msg } });
    }
  }
  
  terminate() {}
}

global.Worker = MockWorker;

// Mock des timers par défaut
jest.useFakeTimers();

// Mock de la visibilité du document
let isHidden = false;
Object.defineProperty(document, 'hidden', {
  configurable: true,
  get: () => isHidden,
  set: (value) => { isHidden = value }
});