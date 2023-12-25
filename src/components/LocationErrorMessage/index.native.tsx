import React from 'react';
import {Linking} from 'react-native';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';
import LocationErrorMessagePropTypes from './types';

/** Opens app level settings from the native system settings  */
const openAppSettings = (): void => {
    Linking.openSettings();
};

function LocationErrorMessage(props: LocationErrorMessagePropTypes) {
    return (
        <BaseLocationErrorMessage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onAllowLocationLinkPress={openAppSettings}
        />
    );
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
export default LocationErrorMessage;
