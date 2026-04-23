import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {
    clearTravelInvoicingErrors,
    clearTravelInvoicingMonthlyLimitErrors,
    clearTravelInvoicingSettlementAccountErrors,
    clearTravelInvoicingSettlementFrequencyErrors,
    configureTravelInvoicingForPolicy,
    deactivateTravelInvoicing,
    payTravelInvoicingSpend,
    retryTravelCardsProvisioning,
} from '@libs/actions/TravelInvoicing';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getCardSettings, getEligibleBankAccountsForCard} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areTravelPersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {hasInProgressUSDVBBA, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import {
    getIsTravelInvoicingEnabled,
    getTravelInvoicingCardSettingsKey,
    getTravelLimit,
    getTravelSettlementAccount,
    getTravelSettlementFrequency,
    getTravelSpend,
    hasOutstandingTravelBalance,
    hasTravelInvoicingSettlementAccount,
} from '@libs/TravelInvoicingUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {updateGeneralSettings as updatePolicyGeneralSettings} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import CentralInvoicingLearnHow from './CentralInvoicingLearnHow';
import CentralInvoicingSubtitleWrapper from './CentralInvoicingSubtitleWrapper';

type WorkspaceTravelInvoicingSectionProps = {
    /** The ID of the policy */
    policyID: string;
};

/**
 * Displays the Travel Invoicing section within the Workspace Travel page.
 * Shows a setup CTA if Travel Invoicing is not configured, otherwise shows the settings.
 */
function WorkspaceTravelInvoicingSection({policyID}: WorkspaceTravelInvoicingSectionProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const {showConfirmModal, closeModal} = useConfirmModal();
    const [isDisableConfirmModalVisible, setIsDisableConfirmModalVisible] = useState(false);
    const [isOutstandingBalanceModalVisible, setIsOutstandingBalanceModalVisible] = useState(false);
    const [isPayBalanceModalVisible, setIsPayBalanceModalVisible] = useState(false);

    // Ref to track if the "Update to USD" modal is open
    const isCurrencyModalOpen = useRef(false);
    // Ref to track if we should auto-resume the toggle flow after returning from TravelLegalNamePage
    const shouldResumeToggleRef = useRef(false);

    // For Travel Invoicing, we use a travel-specific card settings key
    // Uses the same key pattern as Expensify Card: private_expensifyCardSettings_{workspaceAccountID}
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [domainMemberData] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);

    // Resolve travel-specific settings from the shared card settings key
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);

    // Use pure selectors to derive state
    const hasSettlementAccount = hasTravelInvoicingSettlementAccount(travelSettings);
    const travelSpend = getTravelSpend(travelSettings);

    const pendingSettlementAmount = travelSettings?.pendingSettlementAmount ?? 0;
    const hasPendingSettlement = pendingSettlementAmount > 0;
    const travelLimit = getTravelLimit(travelSettings);
    const settlementAccount = getTravelSettlementAccount(travelSettings, bankAccountList);
    const settlementFrequency = getTravelSettlementFrequency(travelSettings);
    const isMonthlySettlementFrequency = settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY;
    const localizedFrequency = isMonthlySettlementFrequency ? translate('workspace.expensifyCard.frequency.monthly') : translate('workspace.expensifyCard.frequency.daily');

    const shouldShowPayButton = travelSpend > 0 && isMonthlySettlementFrequency && !hasPendingSettlement;
    const formattedSpend = convertToDisplayString(travelSpend, CONST.CURRENCY.USD);

    // The pending settlement amount for the "payment queued" subtitle
    const formattedQueuedAmount = convertToDisplayString(pendingSettlementAmount, CONST.CURRENCY.USD);
    const formattedLimit = convertToDisplayString(travelLimit, CONST.CURRENCY.USD);

    // Settlement account display - show empty if no account is selected
    const settlementAccountNumber = hasSettlementAccount && settlementAccount?.last4 ? `${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(settlementAccount?.last4 ?? '')}` : '';

    // Differentiate toggle errors from settlement account errors based on pendingAction
    // Toggle actions use root pendingAction (UPDATE), settlement account uses pendingFields
    const isTogglePendingAction =
        cardSettings?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE ||
        cardSettings?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ||
        cardSettings?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isSettlementAccountPendingAction = cardSettings?.pendingFields?.paymentBankAccountID === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    // Only show errors/pending under the toggle if it's a toggle action
    const toggleErrors = cardSettings?.errors;
    const togglePendingAction = isTogglePendingAction ? cardSettings?.pendingAction : undefined;

    // Only show errors/pending under the settlement account if it's a settlement account action
    const settlementAccountErrors = isSettlementAccountPendingAction ? cardSettings?.errorFields?.paymentBankAccountID : undefined;
    const settlementAccountPendingAction = isSettlementAccountPendingAction ? cardSettings?.pendingFields?.paymentBankAccountID : undefined;

    // Only show error indicator if we have settlement account errors
    const hasSettlementAccountError = !!settlementAccountErrors;
    const hasSettlementFrequencyError = !!cardSettings?.errorFields?.[CONST.TRAVEL.MONTHLY_SETTLEMENT_DATE];
    const settlementFrequencyErrors = hasSettlementFrequencyError ? cardSettings?.errorFields?.[CONST.TRAVEL.MONTHLY_SETTLEMENT_DATE] : null;
    const hasMonthlyLimitError = !!cardSettings?.errorFields?.monthlySpendLimitPerUser;
    const monthlyLimitErrors = hasMonthlyLimitError ? cardSettings?.errorFields?.monthlySpendLimitPerUser : null;
    const formattedMonthlyLimit = convertToDisplayString(travelSettings?.monthlySpendLimitPerUser ?? 0, CONST.CURRENCY.USD);

    // Bank account eligibility for toggle handler
    const isSetupUnfinished = hasInProgressUSDVBBA(reimbursementAccount?.achData);
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountList);

    // Determine if Travel Invoicing is enabled based on isEnabled field
    const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(travelSettings);
    const isOnWaitlist = !!cardOnWaitlist;
    const isLoading = !!cardSettings?.isLoading;
    const hasTravelProvisioningErrors = isTravelInvoicingEnabled && !!domainMemberData?.settings?.travelInvoicing?.errors?.length;

    /**
     * Opens the pay balance confirmation modal.
     */
    const handlePayBalance = () => {
        setIsPayBalanceModalVisible(true);
    };

    /**
     * Handles the confirmed payment of the outstanding travel balance.
     * Closes the modal and triggers the API call with optimistic Onyx update.
     */
    const handleConfirmPayBalance = () => {
        setIsPayBalanceModalVisible(false);
        payTravelInvoicingSpend(workspaceAccountID, travelSpend);
    };

    const continueToggleFlow = () => {
        if (areTravelPersonalDetailsMissing(privatePersonalDetails)) {
            shouldResumeToggleRef.current = true;
            Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_MISSING_PERSONAL_DETAILS.getRoute(policyID));
            return;
        }

        // Turning ON - check if bank account setup is needed first
        if (!eligibleBankAccounts.length || isSetupUnfinished) {
            // No bank accounts - start add bank account flow
            Navigation.navigate(
                ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({
                    policyID,
                    stepToOpen: REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW,
                    backTo: ROUTES.WORKSPACE_TRAVEL.getRoute(policyID),
                }),
            );
            return;
        }

        // If no settlement account configured, navigate to settlement account setup
        // The toggle will be enabled after settlement account is selected
        if (!hasSettlementAccount) {
            Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
            return;
        }

        // Has settlement account - enable Travel Invoicing and navigate to settlement page to show verification state
        if (settlementAccount?.bankAccountID) {
            configureTravelInvoicingForPolicy(policyID, workspaceAccountID, settlementAccount.bankAccountID);
        }
        Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
    };

    const promptCurrencyChangeAndStartFlow = async () => {
        isCurrencyModalOpen.current = true;
        const result = await showConfirmModal({
            title: translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.title'),
            prompt: translate('workspace.bankAccount.updateCurrencyPrompt'),
            confirmText: translate('workspace.bankAccount.updateToUSD'),
            cancelText: translate('common.cancel'),
            danger: true,
        });
        isCurrencyModalOpen.current = false;
        if (result.action !== ModalActions.CONFIRM || !policy) {
            return;
        }
        updatePolicyGeneralSettings(policy, policy.name, CONST.CURRENCY.USD);
        continueToggleFlow();
    };

    /**
     * Handle toggle change for Central Invoicing.
     * When turning ON:
     *   - If has settlement account: call configureTravelInvoicingForPolicy
     *   - If no settlement account: navigate to selection (enable happens after selection)
     * When turning OFF: show confirmation modal, then call deactivateTravelInvoicing.
     */
    const handleToggle = (isEnabled: boolean) => {
        // Check if user is on a public domain - Travel Invoicing requires a private domain
        if (account?.isFromPublicDomain) {
            Navigation.navigate(ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(policyID, Navigation.getActiveRoute()));
            return;
        }

        if (!isEnabled) {
            // Trying to disable - check for outstanding balance first
            if (hasOutstandingTravelBalance(travelSettings)) {
                // Show blocker modal with error message
                setIsOutstandingBalanceModalVisible(true);
                return;
            }
            // Show confirmation modal before disabling
            setIsDisableConfirmModalVisible(true);
            return;
        }

        if (policy?.outputCurrency !== CONST.CURRENCY.USD) {
            promptCurrencyChangeAndStartFlow();
            return;
        }

        continueToggleFlow();
    };

    const handleConfirmDisable = () => {
        setIsDisableConfirmModalVisible(false);
        deactivateTravelInvoicing(policyID, workspaceAccountID);
    };

    // Dismiss the "Update to USD" modal check if the currency changes to USD externally (e.g. from another device)
    useEffect(() => {
        if (policy?.outputCurrency !== CONST.CURRENCY.USD || !isCurrencyModalOpen.current) {
            return;
        }
        closeModal();
        isCurrencyModalOpen.current = false;
    }, [policy?.outputCurrency, closeModal]);

    // Auto-resume the toggle flow after returning from TravelLegalNamePage
    // When the user saves their legal name and navigates back, privatePersonalDetails updates
    // and this effect re-triggers handleToggle(true) to continue the enabling flow
    useEffect(() => {
        if (!shouldResumeToggleRef.current || areTravelPersonalDetailsMissing(privatePersonalDetails)) {
            return;
        }

        shouldResumeToggleRef.current = false;
        handleToggle(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to trigger this effect when privatePersonalDetails changes
    }, [privatePersonalDetails]);

    const getCentralInvoicingSubtitle = () => {
        if (!isTravelInvoicingEnabled) {
            return <CentralInvoicingSubtitleWrapper htmlComponent={<CentralInvoicingLearnHow />} />;
        }
        return <CentralInvoicingSubtitleWrapper />;
    };

    const centralInvoicingSubMenuItems = (
        <>
            {hasTravelProvisioningErrors && (
                <View style={styles.mt4}>
                    <FormHelpMessageRowWithRetryButton
                        message={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.provisioningError')}
                        isButtonSmall
                        onRetry={() => retryTravelCardsProvisioning(policyID, workspaceAccountID, domainMemberData?.settings?.travelInvoicing?.errors ?? [])}
                        danger
                        shouldAlignButtonToMessage
                    />
                </View>
            )}
            <View style={[styles.dFlex, styles.flexRow, styles.mt6, styles.gap4, styles.alignItemsCenter]}>
                <View style={styles.flex1}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelSpendLabel')}
                        title={formattedSpend}
                        wrapperStyle={[styles.sectionMenuItemTopDescription, hasPendingSettlement && styles.pb1]}
                        titleStyle={[styles.textNormalThemeText, styles.headerAnonymousFooter]}
                        descriptionTextStyle={styles.textLabelSupportingNormal}
                        interactive={false}
                    />
                    {hasPendingSettlement && (
                        <Text style={[styles.textLabelSupporting, styles.pb3]}>
                            {translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelSpendPaymentQueued', formattedQueuedAmount)}
                        </Text>
                    )}
                </View>
                {shouldShowPayButton && (
                    <Button
                        text={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelSpendCta')}
                        onPress={handlePayBalance}
                        isDisabled={isOffline}
                        success
                    />
                )}
            </View>
            <MenuItemWithTopDescription
                description={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelLimitLabel')}
                title={formattedLimit}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
                titleStyle={styles.textNormalThemeText}
                descriptionTextStyle={styles.textLabelSupportingNormal}
                interactive={false}
            />
            <OfflineWithFeedback
                errors={settlementAccountErrors}
                pendingAction={settlementAccountPendingAction}
                onClose={() => clearTravelInvoicingSettlementAccountErrors(workspaceAccountID, travelSettings?.previousPaymentBankAccountID ?? null)}
                errorRowStyles={styles.mh2half}
                errorRowTextStyles={styles.mr3}
            >
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.settlementAccountLabel')}
                    title={settlementAccountNumber}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID))}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    titleStyle={settlementAccountNumber ? styles.textNormalThemeText : styles.colorMuted}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    shouldShowRightIcon
                    brickRoadIndicator={hasSettlementAccountError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback
                errors={settlementFrequencyErrors}
                pendingAction={cardSettings?.pendingFields?.monthlySettlementDate}
                onClose={() => clearTravelInvoicingSettlementFrequencyErrors(workspaceAccountID, travelSettings?.previousMonthlySettlementDate)}
                errorRowStyles={styles.mh2half}
                errorRowTextStyles={styles.mr3}
            >
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.settlementFrequencyLabel')}
                    title={localizedFrequency}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_FREQUENCY.getRoute(policyID))}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    titleStyle={styles.textNormalThemeText}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    shouldShowRightIcon
                    brickRoadIndicator={hasSettlementFrequencyError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback
                errors={monthlyLimitErrors}
                pendingAction={cardSettings?.pendingFields?.monthlySpendLimitPerUser}
                onClose={() => clearTravelInvoicingMonthlyLimitErrors(workspaceAccountID)}
                errorRowStyles={styles.mh2half}
                errorRowTextStyles={styles.mr3}
            >
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.monthlySpendLimitLabel')}
                    title={formattedMonthlyLimit}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_MONTHLY_LIMIT.getRoute(policyID))}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    titleStyle={styles.textNormalThemeText}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    shouldShowRightIcon
                    brickRoadIndicator={hasMonthlyLimitError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </>
    );

    return (
        <>
            <Section isCentralPane>
                <ToggleSettingOptionRow
                    title={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.title')}
                    titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle]}
                    subtitle={getCentralInvoicingSubtitle()}
                    switchAccessibilityLabel={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subtitle')}
                    onToggle={handleToggle}
                    isActive={isTravelInvoicingEnabled}
                    disabled={isLoading || isOnWaitlist}
                    disabledAction={isOnWaitlist ? () => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID)) : undefined}
                    pendingAction={togglePendingAction}
                    errors={toggleErrors}
                    onCloseError={() => clearTravelInvoicingErrors(workspaceAccountID)}
                    subMenuItems={centralInvoicingSubMenuItems}
                />
            </Section>

            <ConfirmModal
                title={translate('workspace.moreFeatures.travel.travelInvoicing.disableModal.title')}
                isVisible={isDisableConfirmModalVisible}
                onConfirm={handleConfirmDisable}
                onCancel={() => setIsDisableConfirmModalVisible(false)}
                prompt={translate('workspace.moreFeatures.travel.travelInvoicing.disableModal.body')}
                confirmText={translate('workspace.moreFeatures.travel.travelInvoicing.disableModal.confirm')}
                cancelText={translate('common.cancel')}
                danger
            />

            <ConfirmModal
                title={translate('workspace.moreFeatures.travel.travelInvoicing.outstandingBalanceModal.title')}
                isVisible={isOutstandingBalanceModalVisible}
                onConfirm={() => setIsOutstandingBalanceModalVisible(false)}
                onCancel={() => setIsOutstandingBalanceModalVisible(false)}
                prompt={translate('workspace.moreFeatures.travel.travelInvoicing.outstandingBalanceModal.body')}
                confirmText={translate('workspace.moreFeatures.travel.travelInvoicing.outstandingBalanceModal.confirm')}
                shouldShowCancelButton={false}
            />

            <ConfirmModal
                title={translate('workspace.moreFeatures.travel.travelInvoicing.payBalanceModal.title', formattedSpend)}
                isVisible={isPayBalanceModalVisible}
                onConfirm={handleConfirmPayBalance}
                onCancel={() => setIsPayBalanceModalVisible(false)}
                prompt={translate('workspace.moreFeatures.travel.travelInvoicing.payBalanceModal.body')}
                confirmText={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelSpendCta')}
                cancelText={translate('common.cancel')}
                success
            />
        </>
    );
}

export default WorkspaceTravelInvoicingSection;
