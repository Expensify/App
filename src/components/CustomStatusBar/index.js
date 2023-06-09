import React from 'react';
import StatusBar from '../../libs/StatusBar';

export default class CustomStatusBar extends React.Component {
    componentDidMount() {
        StatusBar.setBarStyle('light-content', true);
    }

    render() {
        return <StatusBar />;
    }
}
