import React from 'react';
import {Linking} from 'react-native';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';

const propTypes = {};
const defaultProps = {};

function LocationErrorMessage() {
    /** opens app level settings from the system settings  */
    const openAppSettings = () => {
        Linking.openSettings();
    };

    return <BaseLocationErrorMessage onAllowLocationLinkPress={openAppSettings} />;
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
LocationErrorMessage.propTypes = propTypes;
LocationErrorMessage.defaultProps = defaultProps;
export default LocationErrorMessage;
