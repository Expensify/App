import StatusBar from './types';

// React Native 0.88 has no StatusBar.setBackgroundColor or setTranslucent (Android is always edge-to-edge), so the
// status bar shows whatever is drawn behind it. Remember the requested color so getBackgroundColor keeps working.
let statusBarColor: string | null = null;

StatusBar.getBackgroundColor = () => statusBarColor;

StatusBar.setBackgroundColor = (color) => {
    statusBarColor = color;
};

StatusBar.setTranslucent = () => {};

export default StatusBar;
