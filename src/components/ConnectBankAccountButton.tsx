import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

type ConnectBankAccountButtonProps = {
    /** PolicyID for navigating to bank account route of that policy */
    policyID: string;

    /** Button styles, also applied for offline message wrapper */
    style?: StyleProp<ViewStyle>;
};

function ConnectBankAccountButton({style, policyID}: ConnectBankAccountButtonProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const activeRoute = Navigation.getActiveRouteWithoutParams();

    return isOffline ? (
        <View style={style}>
            <Text>{`${translate('common.youAppearToBeOffline')} ${translate('common.thisFeatureRequiresInternet')}`}</Text>
        </View>
    ) : (
        <Button
            text={translate('workspace.common.connectBankAccount')}
            onPress={() => ReimbursementAccount.navigateToBankAccountRoute(policyID, activeRoute)}
            icon={Expensicons.Bank}
            style={style}
            shouldShowRightIcon
            large
            success
        />
    );
}

ConnectBankAccountButton.displayName = 'ConnectBankAccountButton';

export default ConnectBankAccountButton;
