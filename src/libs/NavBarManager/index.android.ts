import {NativeModules, processColor} from 'react-native';
import type NavBarManager from './types';
import type {} from './types';

const navBarManager: NavBarManager = {
    setTheme(theme) {
        this.setButtonStyle(theme.navigationBarButtonsStyle);
        this.setBackgroundColor(theme.navigationBarBackgroundColor);
    },
    setButtonStyle: (style) => {
        NativeModules.RNNavBarManager.setButtonStyle(style);
    },
    setBackgroundColor: (color) => {
        const colorNumber = processColor(color);
        NativeModules.RNNavBarManager.setBackgroundColor(colorNumber);
    },
};

export default navBarManager;
