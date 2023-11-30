import StatusBar from './types';

StatusBar.getBackgroundColor = () => {
    const element = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');

    if (!element?.content) {
        return null;
    }

    return element.content;
};

StatusBar.setBackgroundColor = (backgroundColor) => {
    const element = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');

    if (!element) {
        return;
    }

    element.content = backgroundColor as string;
};

export default StatusBar;
