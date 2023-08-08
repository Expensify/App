import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import AddressSearch from '../../components/AddressSearch';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import {withOnyx} from 'react-native-onyx';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import Form from '../../components/Form';

function WaypointEditor(props) {

    function selectWaypoint(details) {
        const lat = details.geometry.location.lat;
        const long = details.geometry.location.lng;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Waypoint Editor"
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            <Form
                style={[styles.flexGrow1, styles.mh5]}
                formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View>
                    <AddressSearch
                        onValueChange={selectWaypoint}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    )

}

export default WaypointEditor;