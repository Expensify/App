import StatusBar from './types';

// Only has custom web implementation
StatusBar.getBackgroundColor = () => null;

// React Native has no setBackgroundColor on iOS, and 0.88 removed it on Android (always edge-to-edge); keep the wrapper API as a no-op
StatusBar.setBackgroundColor = () => {};

export default StatusBar;
