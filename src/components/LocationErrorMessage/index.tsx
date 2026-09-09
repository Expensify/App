import CONST from '@src/CONST';

import React from 'react';
import {Linking} from 'react-native';

import type LocationErrorMessageProps from './types';

import BaseLocationErrorMessage from './BaseLocationErrorMessage';

/** Opens expensify help site in a new browser tab */
const navigateToExpensifyHelpSite = () => {
    Linking.openURL(CONST.NEWHELP_URL);
};

function LocationErrorMessage(props: LocationErrorMessageProps) {
    return (
        <BaseLocationErrorMessage
            {...props}
            onAllowLocationLinkPress={navigateToExpensifyHelpSite}
        />
    );
}

export default LocationErrorMessage;
