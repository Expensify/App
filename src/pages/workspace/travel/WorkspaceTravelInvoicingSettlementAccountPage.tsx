import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import SettlementAccountSelector, {BankAccountListItemLeftElement} from '@components/SettlementAccountSelector';
import type {BankAccountListItem} from '@components/SettlementAccountSelector';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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
import variables from '@styles/variables';
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
    const illustrations = useMemoizedLazyIllustrations(['Puzzle']);
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle();

    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);

    const isLoading = !!cardSettings?.isLoading;
    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountsList);

    const getVerificationState = () => {
        if (cardOnWaitlist) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST;
        }
        if (isLoading) {
            return CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING;
        }
        return '';
    };

    const verificationState = getVerificationState();
    const isInVerificationState = !!verificationState;

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

        const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(cardSettings);

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
            default:
                return translate('workspace.expensifyCard.settlementAccount');
        }
    };

    const renderVerificationStateView = () => {
        switch (verificationState) {
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.LOADING:
                return (
                    <BlockingView
                        title={translate('workspace.expensifyCard.verifyingBankAccount')}
                        subtitle={translate('workspace.expensifyCard.verifyingBankAccountDescription')}
                        animation={LottieAnimations.ReviewingBankInfo}
                        animationStyles={styles.loadingVBAAnimation}
                        animationWebStyle={styles.loadingVBAAnimationWeb}
                        subtitleStyle={styles.textLabelSupporting}
                        containerStyle={styles.pb20}
                        addBottomSafeAreaPadding
                    />
                );
            case CONST.EXPENSIFY_CARD.VERIFICATION_STATE.ON_WAITLIST:
                return (
                    <>
                        <BlockingView
                            title={translate('workspace.expensifyCard.oneMoreStep')}
                            subtitle={translate('workspace.expensifyCard.oneMoreStepDescription')}
                            icon={illustrations.Puzzle}
                            subtitleStyle={styles.textLabelSupporting}
                            iconHeight={variables.cardPreviewHeight}
                            iconWidth={variables.cardPreviewHeight}
                        />
                        <Button
                            success
                            large
                            text={translate('workspace.expensifyCard.goToConcierge')}
                            style={[styles.m5, bottomSafeAreaPaddingStyle]}
                            pressOnEnter
                            onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                        />
                    </>
                );
            default:
                return null;
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
            >
                <HeaderWithBackButton
                    title={getHeaderTitle()}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                {isInVerificationState && renderVerificationStateView()}
                {!isInVerificationState && (
                    <SettlementAccountSelector
                        listOptions={listOptions}
                        onSelectAccount={handleSelectAccount}
                        onAddNewBankAccount={handleAddNewBankAccount}
                        showAddNewAccountOption
                        customHeaderContent={customHeaderContent}
                        initiallyFocusedItemKey={paymentBankAccountID?.toString()}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTravelInvoicingSettlementAccountPage;
