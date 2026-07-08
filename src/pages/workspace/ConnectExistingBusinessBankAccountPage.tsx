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
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import {appendParam} from '@libs/Url';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {ConnectExistingBankAccountNavigatorParamList} from '@navigation/types';

import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import type {PaymentMethodPressHandlerParams} from '@pages/settings/Wallet/WalletPage/types';

import {setReimbursementAccountLoading} from '@userActions/BankAccounts';
import {setWorkspaceReimbursement} from '@userActions/Policy/Policy';
import {navigateToBankAccountRoute, prepareNewBankAccountSetup} from '@userActions/ReimbursementAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type ConnectExistingBusinessBankAccountPageProps = PlatformStackScreenProps<ConnectExistingBankAccountNavigatorParamList, typeof SCREENS.CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT_ROOT>;

function ConnectExistingBusinessBankAccountPage({route}: ConnectExistingBusinessBankAccountPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const policyID = route.params?.policyID;
    const backTo = route.params?.backTo;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const policyName = policy?.name ?? '';
    const policyCurrency = policy?.outputCurrency ?? '';
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isChangingBankAccount = route.params?.source === CONST.BANK_ACCOUNT.CONNECT_EXISTING_SOURCE.CHANGE_BANK_ACCOUNT;
    const isBankAccountFullySetup = !!policy?.achAccount && (policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN || policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.LOCKED);
    const connectedBankAccount = Object.values(bankAccountList ?? {}).find((bankAccount) => bankAccount?.accountData?.additionalData?.policyID === policyID);
    const connectedAccountBankAccountID = (isBankAccountFullySetup ? policy?.achAccount?.bankAccountID : connectedBankAccount?.methodID) ?? CONST.DEFAULT_NUMBER_ID;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleAddBankAccountPress = () => {
        if (isChangingBankAccount) {
            prepareNewBankAccountSetup(policyCurrency);
        }

        setReimbursementAccountLoading(true);
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(
                appendParam(
                    ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(isChangingBankAccount ? {policyID: undefined} : {policyID, backTo}),
                    'stepToOpen',
                    REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW,
                ),
            );
        });
    };

    const handleItemPress = ({methodID, accountData}: PaymentMethodPressHandlerParams) => {
        if (policyID === undefined) {
            return;
        }

        const newReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner ?? '';

        if (bankAccountList && methodID && !bankAccountList[methodID]?.accountData?.policyIDs?.includes(policyID)) {
            setWorkspaceReimbursement({
                policyID,
                currentAchAccount: policy?.achAccount,
                currentReimbursementChoice: policy?.reimbursementChoice,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                bankAccountID: methodID ?? CONST.DEFAULT_NUMBER_ID,
                reimburserEmail: newReimburserEmail,
                accountNumber: accountData?.accountNumber,
                addressName: accountData?.addressName,
                bankName: accountData?.additionalData?.bankName,
                state: accountData?.state,
                lastPaymentMethod: lastPaymentMethod?.[policyID],
                shouldUpdateLastPaymentMethod: accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN,
                bankAccountList,
            });
            setReimbursementAccountLoading(true);
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            if (isBankAccountPartiallySetup(accountData?.state)) {
                navigateToBankAccountRoute({policyID, backTo, navigationOptions: {forceReplace: true}});
            } else {
                setReimbursementAccountLoading(false);
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
                    excludeStates={[CONST.BANK_ACCOUNT.STATE.LOCKED]}
                    excludeBankAccountID={isChangingBankAccount ? connectedAccountBankAccountID : undefined}
                    shouldHideDefaultBadge
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

ConnectExistingBusinessBankAccountPage.displayName = 'ConnectExistingBusinessBankAccountPage';

export default ConnectExistingBusinessBankAccountPage;
