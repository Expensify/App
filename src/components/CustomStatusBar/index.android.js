import React from 'react';
import {StatusBar} from 'react-native';

/**
 * Only the Android platform supports "setBackgroundColor"
 */

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
    }

    render() {
        return <StatusBar />;
    }
}
