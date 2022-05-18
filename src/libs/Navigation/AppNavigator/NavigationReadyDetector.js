import React from 'react';
import Navigation from '../Navigation';

class NavigationReadyDetector extends React.Component {
    componentDidMount() {
        Navigation.setIsNavigationReady();
    }

    componentWillUnmount() {
        Navigation.resetIsNavigationReady();
    }

    render() {
        return null;
    }
}

export default NavigationReadyDetector;
