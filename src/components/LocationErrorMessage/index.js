import React from 'react';
import {Linking} from 'react-native';
import CONST from '../../CONST';
import BaseLocationErrorMessage from './BaseLocationErrorMessage';

const propTypes = {};
const defaultProps = {};

function LocationErrorMessage() {
    /** opens expensfiy help site in a new browser tab */
    const navigateToExpensifyHelpSite = () => {
        Linking.openURL(CONST.NEWHELP_URL);
    };

    return <BaseLocationErrorMessage onAllowLocationLinkPress={navigateToExpensifyHelpSite} />;
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
LocationErrorMessage.propTypes = propTypes;
LocationErrorMessage.defaultProps = defaultProps;
export default LocationErrorMessage;
