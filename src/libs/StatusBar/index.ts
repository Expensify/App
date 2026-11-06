import StatusBar from './types';

// Only has custom web implementation
StatusBar.getBackgroundColor = () => null;

// Native apps draw edge-to-edge, so there is no status bar background to set; keep the wrapper API as a no-op
StatusBar.setBackgroundColor = () => {};

export default StatusBar;
