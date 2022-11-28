import React from 'react';
import themeColors from '../../styles/themes/default';
import {StatusBar} from 'react-native';

/**
 * Only the Android platform supports "setBackgroundColor"
 */

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor(themeColors.appBG);
    }

    render() {
        return <StatusBar />;
    }
}
