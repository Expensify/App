import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import * as ReimbursementAccount from '../libs/actions/ReimbursementAccount';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import Button from './Button';
import {withNetwork} from './OnyxProvider';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import networkPropTypes from './networkPropTypes';
import Text from './Text';
import Navigation from '../libs/Navigation/Navigation';

const propTypes = {
    ...withLocalizePropTypes,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** PolicyID for navigating to bank account route of that policy */
    policyID: PropTypes.string.isRequired,

    /** Button styles, also applied for offline message wrapper */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: [],
};

function ConnectBankAccountButton(props) {
    const activeRoute = Navigation.getActiveRoute().replace(/\?.*/, '');
    return props.network.isOffline ? (
        <View style={props.style}>
            <Text>{`${props.translate('common.youAppearToBeOffline')} ${props.translate('common.thisFeatureRequiresInternet')}`}</Text>
        </View>
    ) : (
        <Button
            text={props.translate('workspace.common.connectBankAccount')}
            onPress={() => ReimbursementAccount.navigateToBankAccountRoute(props.policyID, activeRoute)}
            icon={Expensicons.Bank}
            style={props.style}
            iconStyles={[styles.buttonCTAIcon]}
            shouldShowRightIcon
            large
            success
        />
    );
}

ConnectBankAccountButton.propTypes = propTypes;
ConnectBankAccountButton.defaultProps = defaultProps;
ConnectBankAccountButton.displayName = 'ConnectBankAccountButton';

export default compose(withNetwork(), withLocalize)(ConnectBankAccountButton);
