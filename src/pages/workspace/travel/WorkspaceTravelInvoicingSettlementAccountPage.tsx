import React from 'react';
import BankAccountVerificationView from '@components/BankAccountVerificationView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SettlementAccountSelector, {BankAccountListItemLeftElement} from '@components/SettlementAccountSelector';
import type {BankAccountListItem} from '@components/SettlementAccountSelector';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {configureTravelInvoicingForPolicy, setTravelInvoicingSettlementAccount} from '@libs/actions/TravelInvoicing';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import {getIsTravelInvoicingEnabled, getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {BankName} from '@src/types/onyx/Bank';

type WorkspaceTravelInvoicingSettlementAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT>;

function WorkspaceTravelInvoicingSettlementAccountPage({route}: WorkspaceTravelInvoicingSettlementAccountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);

    const isLoading = !!cardSettings?.isLoading;
    const isSuccess = !!cardSettings?.isSuccess;
    const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(cardSettings);
    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountsList);

    const getVerificationState = () => {
        if (cardOnWaitlist) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST;
        }
        if (isSuccess) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED;
        }
        if (isLoading) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING;
        }
        return '';
    };

    const verificationState = getVerificationState();

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
        if (value === paymentBankAccountID) {
            Navigation.goBack();
            return;
        }

        if (!isTravelInvoicingEnabled) {
            configureTravelInvoicingForPolicy(policyID, workspaceAccountID, value);
            return;
        }

        const previousPaymentBankAccountID = cardSettings?.previousPaymentBankAccountID ?? cardSettings?.paymentBankAccountID;
        setTravelInvoicingSettlementAccount(policyID, workspaceAccountID, value, previousPaymentBankAccountID);
        Navigation.goBack();
    };

    const handleAddNewBankAccount = () => {
        Navigation.navigate(
            ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({
                policyID,
                stepToOpen: REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW,
                backTo: ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID),
            }),
        );
    };

    const customHeaderContent = <Text style={[styles.mh5, styles.mb3]}>{translate('workspace.expensifyCard.chooseExistingBank')}</Text>;

    const getHeaderTitle = () => {
        switch (verificationState) {
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING:
                return translate('workspace.expensifyCard.verifyingHeader');
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.VERIFIED:
                return translate('workspace.moreFeatures.travel.travelInvoicing.enabled');
            default:
                return translate('workspace.expensifyCard.settlementAccount');
        }
    };

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
                shouldShowOfflineIndicator={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER]}>
                    <HeaderWithBackButton
                        title={getHeaderTitle()}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <BankAccountVerificationView
                        verificationState={verificationState}
                        onVerifiedButtonPress={() => Navigation.goBack()}
                        verifiedTitle={translate('workspace.moreFeatures.travel.travelInvoicing.enabled')}
                        verifiedSubtitle={translate('workspace.moreFeatures.travel.travelInvoicing.enabledDescription')}
                    >
                        <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                            <SettlementAccountSelector
                                listOptions={listOptions}
                                onSelectAccount={handleSelectAccount}
                                onAddNewBankAccount={handleAddNewBankAccount}
                                showAddNewAccountOption
                                customHeaderContent={customHeaderContent}
                                initiallyFocusedItemKey={paymentBankAccountID?.toString()}
                            />
                        </FullPageOfflineBlockingView>
                    </BankAccountVerificationView>
                </DelegateNoAccessWrapper>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTravelInvoicingSettlementAccountPage;
