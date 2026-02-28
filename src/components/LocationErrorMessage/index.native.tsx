import React from 'react';
import {Linking} from 'react-native';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';
import type LocationErrorMessageProps from './types';

/** Opens app level settings from the native system settings  */
const openAppSettings = () => {
    Linking.openSettings();
};

function LocationErrorMessage(props: LocationErrorMessageProps) {
    return (
        <BaseLocationErrorMessage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onAllowLocationLinkPress={openAppSettings}
        />
    );
}

export default LocationErrorMessage;
