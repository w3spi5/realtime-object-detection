import { CONFIG } from '../config';

describe('Config', () => {
  it('should have camera configuration', () => {
    expect(CONFIG.camera).toBeDefined();
    expect(CONFIG.camera.video).toBeDefined();
  });

  it('should have detection configuration', () => {
    expect(CONFIG.detection).toBeDefined();
    expect(CONFIG.detection.confidence).toBeDefined();
  });
});