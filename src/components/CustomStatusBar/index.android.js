import React from 'react';
import {StatusBar} from 'react-native';
import themeColors from '../../styles/themes/default';

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
