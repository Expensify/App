import React from 'react';
import {StatusBar} from 'react-native';

/**
 * Only the Android platform supports "setBackgroundColor"
 */

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content');
    }

    render() {
        // Prefer to not render the StatusBar component in Android as it can cause
        // issues with edge to edge display, which we setup in MainActivity.java.
        return null;
    }
}
