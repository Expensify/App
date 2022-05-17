import React from 'react';
import Navigation from '../Navigation';

class NavigationReadyDetector extends React.Component {
    componentDidUpdate() {
        Navigation.setIsNavigationReady();
    }

    render() {
        return null;
    }
}

export default NavigationReadyDetector;
