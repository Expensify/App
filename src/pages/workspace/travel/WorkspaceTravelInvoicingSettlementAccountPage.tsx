import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SettlementAccountSelector, {BankAccountListItemLeftElement} from '@components/SettlementAccountSelector';
import type {BankAccountListItem} from '@components/SettlementAccountSelector';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {setTravelInvoicingSettlementAccount} from '@libs/actions/TravelInvoicing';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';

type WorkspaceTravelInvoicingSettlementAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT>;

/**
 * Settlement account selection page for Travel Invoicing.
 * Uses the SettlementAccountSelector component for the selection UI.
 */
function WorkspaceTravelInvoicingSettlementAccountPage({route}: WorkspaceTravelInvoicingSettlementAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID), {canBeMissing: true});

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountsList);

    const eligibleBankAccountsOptions: BankAccountListItem[] = eligibleBankAccounts?.map((bankAccount) => {
        const bankName = (bankAccount.accountData?.addressName ?? '') as BankName;
        const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
        const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount.methodID;

        return {
            value: bankAccountID,
            text: bankAccount.title,
            leftElement: <BankAccountListItemLeftElement bankName={bankName} />,
            alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
            keyForList: bankAccountID?.toString() ?? '',
            isSelected: bankAccountID === paymentBankAccountID,
        };
    });

    const listOptions: BankAccountListItem[] = eligibleBankAccountsOptions.length > 0 ? eligibleBankAccountsOptions : [];

    const handleSelectAccount = (value: number) => {
        const previousPaymentBankAccountID = cardSettings?.previousPaymentBankAccountID ?? cardSettings?.paymentBankAccountID;
        setTravelInvoicingSettlementAccount(policyID, workspaceAccountID, value, previousPaymentBankAccountID);
        Navigation.goBack();
    };

    const handleAddNewBankAccount = () => {
        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID)));
    };

    const customHeaderContent = <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceTravelInvoicingSettlementAccountPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <SettlementAccountSelector
                    listOptions={listOptions}
                    onSelectAccount={handleSelectAccount}
                    onAddNewBankAccount={handleAddNewBankAccount}
                    showAddNewAccountOption
                    customHeaderContent={customHeaderContent}
                    initiallyFocusedItemKey={paymentBankAccountID?.toString()}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTravelInvoicingSettlementAccountPage;
