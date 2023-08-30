// eslint-disable-next-line no-restricted-imports
import {StatusBar} from 'react-native';

StatusBar.getBackgroundColor = () => {
    const element = document.querySelector('meta[name=theme-color]');
    if (!element || !element.content) {
        return null;
    }
    return element.content;
};

StatusBar.setBackgroundColor = (backgroundColor) => {
    const element = document.querySelector('meta[name=theme-color]');
    if (!element) {
        return;
    }
    element.content = backgroundColor;
};

export default StatusBar;
