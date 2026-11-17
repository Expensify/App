import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import Navigation from '@navigation/Navigation';

import variables from '@styles/variables';

import {openPersonalBankAccountSetupView} from '@userActions/BankAccounts';
import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {authTokenTypeSelector} from '@src/selectors/Session';

import {isCollectingDepositAccountsSelector} from '@selectors/Policy';
import React from 'react';
import {View} from 'react-native';

type BankAccountPurposeProps = {
    /** Callback to call when the user selects a purpose */
    showCountrySelectionStep: () => void;
};

function BankAccountPurpose({showCountrySelectionStep}: BankAccountPurposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['BankCoin', 'WalletAlt2']);
    const [isCollectingDepositAccounts = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: isCollectingDepositAccountsSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    // A workspace collecting deposit accounts needs the bank details its country requires, which the wallet setup does not ask for.
    const onGetReimbursedPressed = () => {
        if (isCollectingDepositAccounts) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.COLLECT_DEPOSIT_ACCOUNT.getRoute()));
            return;
        }
        openPersonalBankAccountSetupView({});
    };

    return (
        <FullPageOfflineBlockingView>
            <View style={styles.mh5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankAccount.bankAccountPurposeTitle')}</Text>
                <MenuItem.Root
                    sentryLabel={
                        isCollectingDepositAccounts
                            ? CONST.SENTRY_LABEL.SETTINGS_WALLET.BANK_ACCOUNT_PURPOSE_GET_REIMBURSED.COLLECT_DEPOSIT_ACCOUNT
                            : CONST.SENTRY_LABEL.SETTINGS_WALLET.BANK_ACCOUNT_PURPOSE_GET_REIMBURSED.PERSONAL_BANK_ACCOUNT
                    }
                    onPress={callIfAuthenticated(onGetReimbursedPressed, session)}
                    style={styles.purposeMenuItem}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <View style={[styles.popoverMenuIcon, styles.ml3, styles.mr2]}>
                                <Icon
                                    src={illustrations.WalletAlt2}
                                    width={variables.menuIconSize}
                                    height={variables.menuIconSize}
                                />
                            </View>
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('bankAccount.getReimbursed')}</MenuItem.Title>
                            <MenuItem.Description>{translate('bankAccount.getReimbursedDescription')}</MenuItem.Description>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
                <MenuItem.Root
                    sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.BANK_ACCOUNT_PURPOSE_MAKE_PAYMENTS}
                    onPress={callIfAuthenticated(showCountrySelectionStep, session)}
                    style={styles.purposeMenuItem}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <View style={[styles.popoverMenuIcon, styles.ml3, styles.mr2]}>
                                <Icon
                                    src={illustrations.BankCoin}
                                    width={variables.menuIconSize}
                                    height={variables.menuIconSize}
                                />
                            </View>
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('bankAccount.makePayments')}</MenuItem.Title>
                            <MenuItem.Description>{translate('bankAccount.makePaymentsDescription')}</MenuItem.Description>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </View>
        </FullPageOfflineBlockingView>
    );
}

BankAccountPurpose.displayName = 'BankAccountPurpose';

export default BankAccountPurpose;
