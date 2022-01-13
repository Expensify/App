import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import * as GeoLocation from '../libs/actions/GeoLocation';
import ONYXKEYS from '../ONYXKEYS';
import Text from '../components/Text';

class DistanceRequestPage extends React.Component {
    componentDidMount() {
        GeoLocation.getCurrentLocation();
    }

    render() {
        return (
            <View style={{margin: 100}}>
                <Text>Geolocation test</Text>
                <Text>{JSON.stringify(this.props.userLocation || '')}</Text>
            </View>
        );
    }
}

export default withOnyx({
    userLocation: {
        key: ONYXKEYS.USER_LOCATION,
    },
})(DistanceRequestPage);
