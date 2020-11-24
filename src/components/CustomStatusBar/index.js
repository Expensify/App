import React from 'react';
import {StatusBar} from 'react-native';

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(true);
    }

    render() {
        return <StatusBar />;
    }
}
