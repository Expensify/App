import StatusBar from './types';

// Only has custom web implementation
StatusBar.getBackgroundColor = () => null;

// Overwrite setTranslucent and setBackgroundColor suppress warnings on iOS
StatusBar.setTranslucent = () => {};
StatusBar.setBackgroundColor = () => {};

export default StatusBar;
