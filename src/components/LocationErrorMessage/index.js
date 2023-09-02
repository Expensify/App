import React from 'react';
import {Linking} from 'react-native';
import CONST from '../../CONST';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';

/** Opens expensify help site in a new browser tab */
const navigateToExpensifyHelpSite = () => {
    Linking.openURL(CONST.NEWHELP_URL);
};

function LocationErrorMessage() {
    return <BaseLocationErrorMessage onAllowLocationLinkPress={navigateToExpensifyHelpSite} />;
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
export default LocationErrorMessage;
