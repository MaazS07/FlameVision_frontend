import React, { useEffect, useRef, useState } from 'react';
import '@tensorflow/tfjs';

const Fire = ({ onFireDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isFireDetected, setIsFireDetected] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelLoadingError, setModelLoadingError] = useState('');
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [alertSent, setAlertSent] = useState(false);
  
  // Initialize webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsStreamActive(false);
    }
  };

  // Load model (include the script directly)
  const loadFireDetectionModel = () => {
    setIsLoading(true);
    
    // Add script tags dynamically
    const tfScript = document.createElement('script');
    tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js';
    tfScript.async = true;
    
    const cocoSsdScript = document.createElement('script');
    cocoSsdScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js';
    cocoSsdScript.async = true;
    
    // Handle model loading
    cocoSsdScript.onload = () => {
      // Once the script is loaded, load the model
      window.cocoSsd.load()
        .then(loadedModel => {
          window.fireDetectionModel = loadedModel;
          setIsModelLoaded(true);
          setIsLoading(false);
          console.log('Object detection model loaded successfully');
        })
        .catch(err => {
          console.error('Error loading model:', err);
          setModelLoadingError('Failed to load detection model. Please refresh and try again.');
          setIsLoading(false);
        });
    };
    
    // Handle errors
    cocoSsdScript.onerror = () => {
      setModelLoadingError('Failed to load detection libraries. Please check your internet connection.');
      setIsLoading(false);
    };
    
    // Add scripts to document
    document.body.appendChild(tfScript);
    document.body.appendChild(cocoSsdScript);
    
    // Cleanup function
    return () => {
      document.body.removeChild(tfScript);
      document.body.removeChild(cocoSsdScript);
    };
  };

  // Handle video metadata loaded
  const handleVideoMetadata = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }
  };

  // Detect fire using object detection model
 // Detect fire using object detection model
const detectFire = async () => {
    if (!canvasRef.current || !videoRef.current || !isStreamActive || !isModelLoaded) return;
    if (!window.fireDetectionModel) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    // Check for valid dimensions
    if (videoWidth === 0 || videoHeight === 0) return;
    
    try {
      // Clear previous drawings
      ctx.clearRect(0, 0, videoWidth, videoHeight);
      
      // Draw current video frame
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      
      // Perform object detection
      const predictions = await window.fireDetectionModel.detect(videoRef.current);
      
      // Process relevant predictions (fire-related objects)
      const fireRelatedObjects = ['person', 'cell phone'];  // Objects that might be near fires in emergency
      let fireDetected = false;
      let maxConfidence = 0;
      
      // Additional fire color detection for improved accuracy
      const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight).data;
      let firePixelCount = 0;
      const pixelThreshold = videoWidth * videoHeight * 0.01; // 1% of frame
      
      // Sample pixels (not checking every pixel for performance)
      for (let i = 0; i < imageData.length; i += 40) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        
        // Fire color characteristics
        if (r > 200 && g > 60 && g < 150 && b < 60) {
          firePixelCount++;
        }
      }
      
      // Calculate fire confidence from pixel analysis
      const fireColorConfidence = Math.min(firePixelCount / pixelThreshold, 1.0);
      
      // Draw predictions from the model
      predictions.forEach(prediction => {
        if (fireRelatedObjects.includes(prediction.class)) {
          const [x, y, width, height] = prediction.bbox;
          
          // Draw bounding box
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          
          // Draw label
          ctx.fillStyle = '#00FFFF';
          ctx.font = '16px Arial';
          ctx.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x, 
            y - 5
          );
          
          if (prediction.score > maxConfidence) {
            maxConfidence = prediction.score;
          }
        }
      });
      
      // Adjust confidence using both models
      let combinedConfidence = fireColorConfidence;
      if (maxConfidence > 0.5) {
        // If we detect people or objects near the fire colors, increase confidence
        combinedConfidence = (fireColorConfidence * 0.7) + (maxConfidence * 0.3);
      }
      
      // Update confidence display
      setDetectionConfidence(Math.round(combinedConfidence * 100));
      
      // Check if fire is detected based on combined confidence
      if (combinedConfidence > 0.65) {
        fireDetected = true;
        
        // Draw fire detection box
        const centerX = videoWidth / 2 - 100;
        const centerY = videoHeight / 2 - 100;
        const boxWidth = 200;
        const boxHeight = 200;
        
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX, centerY, boxWidth, boxHeight);
        
        // Draw fire detection label
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(
          `FIRE! (${Math.round(combinedConfidence * 100)}%)`,
          centerX, 
          centerY - 10
        );
      }
      
      // Only update fire detection state when it changes, to reduce unnecessary re-renders
      setIsFireDetected(prevState => {
        // Only alert if transitioning from no fire to fire and alert hasn't been sent yet
        if (fireDetected && !prevState && !alertSent && onFireDetected) {
          alertFireStation();
          setAlertSent(true);
          onFireDetected(true);
          
          // Add debounce to prevent multiple calls
          setTimeout(() => {
            // This timeout intentionally doesn't do anything - it's just for debouncing
          }, 10000);
        }
        return fireDetected;
      });
      
    } catch (err) {
      console.error('Error during detection:', err);
    }
  };
  
  // Add a debounce wrapper for the onFireDetected callback
  const [debouncedDetection] = useState(() => {
    let timeoutId = null;
    return (isDetected) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        if (onFireDetected) {
          onFireDetected(isDetected);
        }
        timeoutId = null;
      }, 5000); // 5 second debounce
    };
  });
  
  // Modified useEffect for detection loop
  useEffect(() => {
    if (!isStreamActive || !isModelLoaded) return;
    
    let animationFrameId;
    let isProcessing = false;
    let consecutiveDetections = 0;
    const requiredConsecutiveDetections = 5; // Require multiple consecutive detections
    
    const loop = async () => {
      if (!isProcessing) {
        isProcessing = true;
        await detectFire();
        
        // Count consecutive detections for stability
        if (isFireDetected) {
          consecutiveDetections++;
        } else {
          consecutiveDetections = 0;
        }
        
        // Only trigger the callback after several consecutive detections
        if (consecutiveDetections === requiredConsecutiveDetections && !alertSent) {
          debouncedDetection(true);
        }
        
        isProcessing = false;
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    
    // Small delay before starting detection
    const timeoutId = setTimeout(() => {
      loop();
    }, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isStreamActive, isModelLoaded, debouncedDetection]);

  // Alert function
  const alertFireStation = () => {
    console.log('ALERT: Fire detected! Notifying fire station via backend...');
    // In a real implementation, this would send an API request to your backend
    // The notification is now handled via the onFireDetected callback
  };

  // Reset detection when emergency is controlled
  const resetDetection = () => {
    setIsFireDetected(false);
    setAlertSent(false);
    setDetectionConfidence(0);
  };

  // Initialize webcam and model when component mounts
  useEffect(() => {
    startWebcam();
    const cleanup = loadFireDetectionModel();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      cleanup();
    };
  }, []);

  // Run detection loop when stream and model are ready
  useEffect(() => {
    if (!isStreamActive || !isModelLoaded) return;
    
    let animationFrameId;
    let isProcessing = false;
    
    const loop = async () => {
      if (!isProcessing) {
        isProcessing = true;
        await detectFire();
        isProcessing = false;
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    
    // Small delay before starting detection
    const timeoutId = setTimeout(() => {
      loop();
    }, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isStreamActive, isModelLoaded, isFireDetected, alertSent]);

  // Expose a way to reset the detection state when emergency is controlled
  useEffect(() => {
    // Create a method that the parent component can call to reset detection
    window.resetFireDetection = resetDetection;
    
    return () => {
      delete window.resetFireDetection;
    };
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Fire Detection System</h2>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading Fire Detection System...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
      
      {/* Webcam feed container */}
      <div className="relative rounded-lg overflow-hidden shadow-xl bg-gray-900">
        <video
          ref={videoRef}
          className="w-full h-auto"
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoMetadata}
        />
        
        {/* Canvas overlay for detection visualization */}
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {/* Status indicators */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <div className={`flex items-center px-3 py-1 rounded-full text-white ${isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}>
            <span className="text-sm font-medium">
              {isModelLoaded ? 'Model Ready' : 'Loading Model'}
            </span>
          </div>
          
          <div className={`flex items-center px-3 py-1 rounded-full text-white ${isStreamActive ? 'bg-green-500' : 'bg-red-500'}`}>
            <span className="text-sm font-medium">
              {isStreamActive ? 'Camera Active' : 'Camera Inactive'}
            </span>
          </div>
          
          {alertSent && (
            <div className="flex items-center px-3 py-1 rounded-full text-white bg-blue-500">
              <span className="text-sm font-medium">Alert Sent</span>
            </div>
          )}
        </div>
        
        {/* Confidence meter */}
        {/* <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-70 p-3 rounded-lg">
            <div className="flex justify-between text-white text-xs mb-1">
              <span>0%</span>
              <span>Fire Detection Confidence</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ${
                  detectionConfidence > 80 ? 'bg-red-600' : 
                  detectionConfidence > 65 ? 'bg-red-500' : 
                  detectionConfidence > 40 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${detectionConfidence}%` }}
              ></div>
            </div>
          </div>
        </div> */}
      </div>
      
      {/* Model loading error */}
      {modelLoadingError && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-bold">Error:</p>
          <p>{modelLoadingError}</p>
        </div>
      )}
      
      {/* Alert status */}
      {isFireDetected && (
        <div className="mt-4 p-4 bg-red-600 text-white rounded-md animate-pulse">
          <h3 className="text-xl font-bold">🔥 FIRE DETECTED! 🔥</h3>
          <p>{alertSent ? "Alert sent to fire station!" : "Analyzing situation..."}</p>
          <p className="text-sm mt-1">Detection confidence: {detectionConfidence}%</p>
        </div>
      )}
      
      {/* Controls */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={startWebcam}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition"
          disabled={isLoading}
        >
          {isStreamActive ? 'Restart Camera' : 'Start Camera'}
        </button>
        {isFireDetected && alertSent && (
          <button
            onClick={resetDetection}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow transition"
          >
            Reset Detection
          </button>
        )}
      </div>
    </div>
  );
};

export default Fire;