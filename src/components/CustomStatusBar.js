import React from 'react';
import StatusBar from '../libs/StatusBar';
import themeColors from '../styles/themes/default';

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor(themeColors.appBG);
    }

    render() {
        return <StatusBar />;
    }
}
