import React from 'react';
import {StatusBar} from 'react-native';

/**
 * Only the Android platform supports "setBackgroundColor" and "setTranslucent"
 */

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setBackgroundColor('transparent', true);
    }

    render() {
        return <StatusBar />;
    }
}
