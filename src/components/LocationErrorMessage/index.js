import React from 'react';
import {Linking} from 'react-native';
import CONST from '@src/CONST';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';
import * as locationErrorMessagePropTypes from './locationErrorMessagePropTypes';

/** Opens expensify help site in a new browser tab */
const navigateToExpensifyHelpSite = () => {
    Linking.openURL(CONST.NEWHELP_URL);
};

function LocationErrorMessage(props) {
    return (
        <BaseLocationErrorMessage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onAllowLocationLinkPress={navigateToExpensifyHelpSite}
        />
    );
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
LocationErrorMessage.propTypes = locationErrorMessagePropTypes.propTypes;
LocationErrorMessage.defaultProps = locationErrorMessagePropTypes.defaultProps;
export default LocationErrorMessage;
