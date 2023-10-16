import React from 'react';
import {Linking} from 'react-native';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';
import * as locationErrorMessagePropTypes from './locationErrorMessagePropTypes';

/** Opens app level settings from the native system settings  */
const openAppSettings = () => {
    Linking.openSettings();
};

function LocationErrorMessage(props) {
    return (
        <BaseLocationErrorMessage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onAllowLocationLinkPress={openAppSettings}
        />
    );
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
LocationErrorMessage.propTypes = locationErrorMessagePropTypes.propTypes;
LocationErrorMessage.defaultProps = locationErrorMessagePropTypes.defaultProps;
export default LocationErrorMessage;
