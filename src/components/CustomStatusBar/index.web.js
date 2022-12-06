import React from 'react';
import {StatusBar} from 'react-native';
import themeColors from '../../styles/themes/default';

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content', true);

        // Match the default status bar color to the app's background color.
        document.querySelector('meta[name=theme-color]').content = themeColors.appBG;
    }

    render() {
        return <StatusBar />;
    }
}
