import StatusBar from './types';

StatusBar.getBackgroundColor = () => {
    const element = document.querySelector('meta[name=theme-color]');

    if (element && 'content' in element && (typeof element.content === 'string' || typeof element.content === 'symbol')) {
        return element.content;
    }

    return null;
};

StatusBar.setBackgroundColor = (backgroundColor) => {
    const element = document.querySelector('meta[name=theme-color]');
    if (element && 'content' in element) {
        element.content = backgroundColor;
    }
};

export default StatusBar;
