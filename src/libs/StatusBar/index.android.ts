import StatusBar from './types';

const setBackgroundColor = StatusBar.setBackgroundColor;

let statusBarColor: string | null = null;

StatusBar.getBackgroundColor = () => statusBarColor;

StatusBar.setBackgroundColor = (color, animated = false) => {
    statusBarColor = color as string;
    setBackgroundColor(color, animated);
};

export default StatusBar;
