import React from 'react';
import {Linking} from 'react-native';
import CONST from '../../CONST';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';

function LocationErrorMessage() {
    /** Opens expensify help site in a new browser tab */
    const navigateToExpensifyHelpSite = () => {
        Linking.openURL(CONST.NEWHELP_URL);
    };

    return <BaseLocationErrorMessage onAllowLocationLinkPress={navigateToExpensifyHelpSite} />;
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
export default LocationErrorMessage;
