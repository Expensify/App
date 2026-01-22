import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {ConnectExistingBankAccountNavigatorParamList} from '@navigation/types';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import type {PaymentMethodPressHandlerParams} from '@pages/settings/Wallet/WalletPage/types';
import {pressedOnLockedBankAccount} from '@userActions/BankAccounts';
import {setWorkspaceReimbursement} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ConnectExistingBusinessBankAccountPageProps = PlatformStackScreenProps<ConnectExistingBankAccountNavigatorParamList, typeof SCREENS.CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT_ROOT>;

function ConnectExistingBusinessBankAccountPage({route}: ConnectExistingBusinessBankAccountPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const policyName = policy?.name ?? '';
    const policyCurrency = policy?.outputCurrency ?? '';
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleAddBankAccountPress = () => {
        navigateToBankAccountRoute(policyID);
    };

    const handleItemPress = ({methodID, accountData}: PaymentMethodPressHandlerParams) => {
        if (policyID === undefined) {
            return;
        }

        if (accountData?.state === CONST.BANK_ACCOUNT.STATE.LOCKED && accountData?.bankAccountID) {
            pressedOnLockedBankAccount(accountData?.bankAccountID);
            navigateToConciergeChat();
            return;
        }

        const newReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner ?? '';
        setWorkspaceReimbursement({
            policyID,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            bankAccountID: methodID ?? CONST.DEFAULT_NUMBER_ID,
            reimburserEmail: newReimburserEmail,
            lastPaymentMethod: lastPaymentMethod?.[policyID],
            shouldUpdateLastPaymentMethod: accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN,
        });

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            if (isBankAccountPartiallySetup(accountData?.state)) {
                navigateToBankAccountRoute(route.params.policyID);
            } else {
                Navigation.closeRHPFlow();
            }
        });
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ConnectExistingBusinessBankAccountPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                subtitle={policyName}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView style={[styles.w100, shouldUseNarrowLayout ? [styles.pt3, styles.ph5, styles.pb5] : [styles.pt5, styles.ph8, styles.pb8]]}>
                <Text>{translate('workspace.bankAccount.chooseAnExisting')}</Text>
                <PaymentMethodList
                    onPress={handleItemPress}
                    onAddBankAccountPress={handleAddBankAccountPress}
                    style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                    listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                    itemIconRight={icons.ArrowRight}
                    filterType={CONST.BANK_ACCOUNT.TYPE.BUSINESS}
                    filterCurrency={policyCurrency}
                    shouldHideDefaultBadge
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

ConnectExistingBusinessBankAccountPage.displayName = 'ConnectExistingBusinessBankAccountPage';

export default ConnectExistingBusinessBankAccountPage;
