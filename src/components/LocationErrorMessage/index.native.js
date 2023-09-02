import React from 'react';
import {Linking} from 'react-native';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';

/** Opens app level settings from the native system settings  */
const openAppSettings = () => {
    Linking.openSettings();
};

function LocationErrorMessage() {
    return <BaseLocationErrorMessage onAllowLocationLinkPress={openAppSettings} />;
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
export default LocationErrorMessage;
