import React from 'react';
import {StatusBar} from 'react-native';

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content', true);
    }

    render() {
        return <StatusBar />;
    }
}
