import _ from 'underscore';
import React from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {StyleSheet, View} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import * as GeoLocation from '../libs/actions/GeoLocation';
import ONYXKEYS from '../ONYXKEYS';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import MenuItem from '../components/MenuItem';

class DistanceRequestPage extends React.Component {
    componentDidMount() {
        GeoLocation.getCurrentLocation();
    }

    render() {
        const points = lodashGet(this.props.distanceRequest, 'points', []);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title="Request money"
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <MenuItem
                    title="Beginning address"
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate('iou/request/distance/address/0')}
                />
                <MenuItem
                    title="Ending address"
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate('iou/request/distance/address/1')}
                />
                <View style={{flex: 1}}>
                    {!this.props.userLocation.loading && (
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{...StyleSheet.absoluteFillObject}}
                            initialRegion={{
                                latitude: this.props.userLocation.latitude,
                                longitude: this.props.userLocation.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            on
                        >
                            {_.map(points, (point, index) => (
                                <Marker
                                    key={index}
                                    coordinate={point.coordinates}
                                />
                            ))}
                        </MapView>
                    )}
                </View>
            </ScreenWrapper>
        );
    }
}

DistanceRequestPage.propTypes = {
    userLocation: PropTypes.shape({
        longitude: PropTypes.number,
        latitude: PropTypes.number,
        loading: PropTypes.bool,
    }),
};
DistanceRequestPage.defaultProps = {
    userLocation: {
        longitude: 0,
        latitude: 0,
        loading: true,
    },
};

export default withOnyx({
    userLocation: {
        key: ONYXKEYS.USER_LOCATION,
        initWithStoredValues: false,
    },
    distanceRequest: {
        key: ONYXKEYS.DISTANCE_REQUEST,
        initWithStoredValues: false,
    },
})(DistanceRequestPage);
