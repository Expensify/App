import React from 'react';
import {Linking} from 'react-native';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';

function LocationErrorMessage() {
    /** opens app level settings from the system settings  */
    const openAppSettings = () => {
        Linking.openSettings();
    };

    return <BaseLocationErrorMessage onAllowLocationLinkPress={openAppSettings} />;
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
export default LocationErrorMessage;
