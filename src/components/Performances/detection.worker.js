let model = null;
let processing = false;

self.onmessage = async function (e) {
  const { type, data } = e.data;

  switch (type) {
    case 'LOAD_MODEL':
      await loadModel();
      break;

    case 'PROCESS_FRAME':
      if (!processing) {
        processing = true;
        const predictions = await processFrame(data.imageData);
        self.postMessage({ type: 'PREDICTIONS', data: predictions });
        processing = false;
      }
      break;
  }
};

async function loadModel() {
  try {
    // Importing TensorFlow.js and COCO-SSD in the worker
    importScripts(
      'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs',
      'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd'
    );

    model = await cocoSsd.load({
      base: 'lite',
      modelUrl: self.modelConfig?.modelUrl,
    });

    self.postMessage({ type: 'MODEL_LOADED' });
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: { message: 'Error loading model', error: error.message },
    });
  }
}

async function processFrame(imageData) {
  try {
    if (!model) {
      throw new Error('Model not loaded');
    }

    const tensor = tf.browser.fromPixels(imageData);
    const predictions = await model.detect(tensor);

    // Clean up
    tensor.dispose();

    return predictions.filter((p) => p.score > (self.modelConfig?.confidence || 0.6));
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      data: { message: 'Error processing frame', error: error.message },
    });
    return [];
  }
}

// Memory management
setInterval(() => {
  if ('tf' in self) {
    tf.engine().purgeUnusedTensors();
  }
}, 10000);
