import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';
import networkPropTypes from './networkPropTypes';
import {withNetwork} from './OnyxProvider';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

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
    const styles = useThemeStyles();
    const activeRoute = Navigation.getActiveRouteWithoutParams();
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
