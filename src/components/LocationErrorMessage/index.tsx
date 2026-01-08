import React from 'react';
import {Linking} from 'react-native';
import CONST from '@src/CONST';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';
import type LocationErrorMessageProps from './types';

/** Opens expensify help site in a new browser tab */
const navigateToExpensifyHelpSite = () => {
    Linking.openURL(CONST.NEWHELP_URL);
};

function LocationErrorMessage(props: LocationErrorMessageProps) {
    return (
        <BaseLocationErrorMessage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onAllowLocationLinkPress={navigateToExpensifyHelpSite}
        />
    );
}

export default LocationErrorMessage;
