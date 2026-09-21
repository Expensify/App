import StatusBar from './types';

// RN 0.88 removed StatusBar.setBackgroundColor and setTranslucent on Android (edge-to-edge is always on),
// so the original implementation is undefined there. Keep the wrapper API working: remember the color
// and only forward to React Native when the method still exists (RN <= 0.86).
const setBackgroundColor: ((color: string, animated?: boolean) => void) | undefined = StatusBar.setBackgroundColor;

let statusBarColor: string | null = null;

StatusBar.getBackgroundColor = () => statusBarColor;

StatusBar.setBackgroundColor = (color, animated = false) => {
    statusBarColor = color as string;
    if (typeof setBackgroundColor === 'function') {
        setBackgroundColor(color as string, animated);
    }
};

if (typeof StatusBar.setTranslucent !== 'function') {
    StatusBar.setTranslucent = () => {};
}

export default StatusBar;
