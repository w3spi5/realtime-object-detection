// Mock TensorFlow.js COCO-SSD
global.cocoSsd = {
  load: jest.fn().mockResolvedValue({
    detect: jest.fn().mockResolvedValue([])
  })
};

// Mock browser APIs
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({})
};

// Mock HTML elements
document.getElementById = jest.fn().mockImplementation((id) => {
  if (id === 'video' || id === 'canvas') {
    return {
      getContext: () => ({
        clearRect: jest.fn(),
        strokeRect: jest.fn(),
        fillRect: jest.fn(),
        fillText: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 100 })
      }),
      width: 640,
      height: 480
    };
  }
  return null;
});