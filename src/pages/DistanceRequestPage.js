import React from 'react';
import * as Geolocation from '../libs/Geolocation';

class DistanceRequestPage extends React.Component {
    componentDidMount() {
        Geolocation.requestPermission();
    }

    render() {
        return null;
    }
}

export default DistanceRequestPage;
