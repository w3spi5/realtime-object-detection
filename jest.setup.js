global.cocoSsd = {
  load: jest.fn().mockResolvedValue({
    detect: jest.fn().mockResolvedValue([])
  })
};

global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({})
};