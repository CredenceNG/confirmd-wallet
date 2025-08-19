// Simple test to check if react-native-vision-camera imports work
try {
  const { Camera, useCameraPermission, useCameraDevice, useCodeScanner } = require('react-native-vision-camera');
  console.log('✅ react-native-vision-camera imports successfully');
  console.log('✅ Available exports:', {
    Camera: typeof Camera,
    useCameraPermission: typeof useCameraPermission,
    useCameraDevice: typeof useCameraDevice,
    useCodeScanner: typeof useCodeScanner
  });
} catch (error) {
  console.error('❌ Error importing react-native-vision-camera:', error.message);
}