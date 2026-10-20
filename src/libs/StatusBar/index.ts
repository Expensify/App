import StatusBar from './types';

// Only has custom web implementation
StatusBar.getBackgroundColor = () => null;

// React Native has no setTranslucent or setBackgroundColor on iOS; keep the wrapper API as no-ops
StatusBar.setTranslucent = () => {};
StatusBar.setBackgroundColor = () => {};

export default StatusBar;
