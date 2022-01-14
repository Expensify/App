/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import {View} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import AddressSearch from '../components/AddressSearch';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';

class DistanceAddressEntryPage extends React.Component {
    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title=""
                    onCloseButtonPress={Navigation.dismissModal}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View
                    style={[styles.m5]}
                >
                    <AddressSearch
                        label="Beginning address"
                        containerStyles={[]}
                        shouldReturnLocation
                        onChange={(values) => {
                            if (!values || !values.coordinates) {
                                return;
                            }

                            const points = lodashGet(this.props, 'distanceRequest.points', []);
                            const index = parseInt(this.props.route.params.index, 10);

                            if (!index && index !== 0) {
                                throw new Error('Missing index');
                            }

                            points[index] = {
                                coordinates: {latitude: values.coordinates.lat, longitude: values.coordinates.lng},
                            };

                            Onyx.merge(ONYXKEYS.DISTANCE_REQUEST, {points: null});
                            Onyx.merge(ONYXKEYS.DISTANCE_REQUEST, {points});
                            Navigation.goBack();
                        }}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

export default withOnyx({
    distanceRequest: {
        key: ONYXKEYS.DISTANCE_REQUEST,
    },
})(DistanceAddressEntryPage);
