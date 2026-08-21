import Button from '@components/ButtonComposed';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    clearTravelBillingErrors,
    clearTravelBillingMonthlyLimitErrors,
    clearTravelBillingSettlementAccountErrors,
    clearTravelBillingSettlementFrequencyErrors,
    configureTravelBillingForPolicy,
    deactivateTravelBilling,
    payTravelBillingSpend,
    retryTravelCardsProvisioning,
} from '@libs/actions/TravelBilling';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getCardSettings, getEligibleBankAccountsForCard} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areTravelPersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {hasInProgressUSDVBBA} from '@libs/ReimbursementAccountUtils';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import {
    getIsTravelBillingPayByInvoice,
    getIsTravelBillingEnabled,
    getPendingTravelBillingAmount,
    getTravelBillingCardSettingsKey,
    getTravelBillingFeedID,
    getTravelLimit,
    getTravelSettlementAccount,
    getTravelSettlementFrequency,
    getTravelSpend,
    hasOutstandingTravelBalance,
    hasTravelBillingSettlementAccount,
} from '@libs/TravelBillingUtils';
import {getSearchParamFromPath} from '@libs/Url';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {updateGeneralSettings as updatePolicyGeneralSettings} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import TravelBillingLearnHow from './TravelBillingLearnHow';
import TravelBillingSubtitleWrapper from './TravelBillingSubtitleWrapper';

type WorkspaceTravelBillingSectionProps = {
    /** The ID of the policy */
    policyID: string;
};

/**
 * Displays the Travel Billing section within the Workspace Travel page.
 * Shows a setup CTA if Travel Billing is not configured, otherwise shows the settings.
 */
function WorkspaceTravelBillingSection({policyID}: WorkspaceTravelBillingSectionProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const defaultFundID = useDefaultFundID(policyID);

    const {showConfirmModal, closeModal} = useConfirmModal();
    const [isDisableConfirmModalVisible, setIsDisableConfirmModalVisible] = useState(false);
    const [isOutstandingBalanceModalVisible, setIsOutstandingBalanceModalVisible] = useState(false);
    const [isPayBalanceModalVisible, setIsPayBalanceModalVisible] = useState(false);

    // Ref to track if the "Update to USD" modal is open
    const isCurrencyModalOpen = useRef(false);
    // Ref to track if we should auto-resume the toggle flow after returning from TravelLegalNamePage
    const shouldResumeToggleRef = useRef(false);

    // Read the travel feed from the resolved fund so a shared domain feed shows feed-wide spend and limit.
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(defaultFundID));
    const [cardOnWaitlist] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST}${policyID}`);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {canWrite: canWriteMoreFeatures, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [domainMemberData] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${defaultFundID}`);

    // Resolve travel-specific settings from the shared card settings key
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);

    // Use pure selectors to derive state
    const hasSettlementAccount = hasTravelBillingSettlementAccount(travelSettings);
    const travelSpend = getTravelSpend(travelSettings);

    const pendingSettlementAmount = travelSettings?.pendingSettlementAmount ?? 0;
    const hasPendingSettlement = pendingSettlementAmount > 0;

    // Pay-by-invoice customers owe the sent invoice by wire, so it's surfaced separately from a queued ACH settlement
    const pendingInvoiceAmount = getPendingTravelBillingAmount(travelSettings);
    const hasPendingInvoice = pendingInvoiceAmount > 0;
    const travelLimit = getTravelLimit(travelSettings);
    const settlementAccount = getTravelSettlementAccount(travelSettings, bankAccountList);
    const settlementFrequency = getTravelSettlementFrequency(travelSettings);
    const isMonthlySettlementFrequency = settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY;
    const localizedFrequency = isMonthlySettlementFrequency ? translate('workspace.expensifyCard.frequency.monthly') : translate('workspace.expensifyCard.frequency.daily');

    const shouldShowPayButton = travelSpend > 0 && travelSpend > pendingInvoiceAmount && isMonthlySettlementFrequency && !hasPendingSettlement;
    const formattedSpend = convertToDisplayString(travelSpend, CONST.CURRENCY.USD);

    // Pay-by-invoice customers settle by wire against an invoice, so the pay CTA and modal use invoice copy
    const isPayByInvoice = getIsTravelBillingPayByInvoice(travelSettings);
    const payBalanceCtaText = translate(
        isPayByInvoice
            ? 'workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.sendInvoiceNowCta'
            : 'workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.currentTravelSpendCta',
    );
    const payBalanceModalTitle = isPayByInvoice
        ? translate('workspace.moreFeatures.travel.travelInvoicing.sendInvoiceModal.title', formattedSpend)
        : translate('workspace.moreFeatures.travel.travelInvoicing.payBalanceModal.title', formattedSpend);
    const payBalanceModalBody = translate(
        isPayByInvoice ? 'workspace.moreFeatures.travel.travelInvoicing.sendInvoiceModal.body' : 'workspace.moreFeatures.travel.travelInvoicing.payBalanceModal.body',
    );

    // The spend label and its buttons only fit on one row on large screens; stack them below otherwise
    const shouldStackButtons = !isLargeScreenWidth;

    // The pending settlement amount for the "payment queued" subtitle
    const formattedQueuedAmount = convertToDisplayString(pendingSettlementAmount, CONST.CURRENCY.USD);
    // The outstanding invoice amount for the "awaiting payment" subtitle
    const formattedPendingInvoiceAmount = convertToDisplayString(pendingInvoiceAmount, CONST.CURRENCY.USD);
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

    // Determine if Travel Billing is enabled based on isEnabled field
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const isOnWaitlist = !!cardOnWaitlist;
    const isLoading = !!cardSettings?.isLoading;
    const hasOutstandingBalance = hasOutstandingTravelBalance(travelSettings);
    const travelProvisioningErrors = domainMemberData?.settings?.travelInvoicing?.errors;
    const hasTravelProvisioningErrors = isTravelBillingEnabled && !!travelProvisioningErrors && Object.keys(travelProvisioningErrors).length > 0;

    /**
     * Opens the pay balance confirmation modal.
     */
    const handlePayBalance = () => {
        setIsPayBalanceModalVisible(true);
    };

    /**
     * Navigates to the Spend page pre-filtered on the Consolidated Travel Billing feed so admins
     * can reconcile their travel spend.
     */
    const handleViewOnSpend = () => {
        const travelFeedID = getTravelBillingFeedID(defaultFundID);
        const query = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            feed: [travelFeedID],
        });
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
    };

    /**
     * Handles the confirmed payment of the outstanding travel balance.
     * Closes the modal and triggers the API call with optimistic Onyx update.
     */
    const handleConfirmPayBalance = () => {
        setIsPayBalanceModalVisible(false);
        payTravelBillingSpend(policyID, defaultFundID, travelSpend);
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

        // Has settlement account - enable Travel Billing and navigate to settlement page to show verification state
        if (settlementAccount?.bankAccountID) {
            configureTravelBillingForPolicy(policyID, defaultFundID, settlementAccount.bankAccountID);
        }
        Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
    };

    const promptCurrencyChangeAndStartFlow = async () => {
        isCurrencyModalOpen.current = true;
        const result = await showConfirmModal({
            title: translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.title'),
            prompt: translate('workspace.bankAccount.updateCurrencyPrompt'),
            confirmText: translate('workspace.bankAccount.updateToUSD'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
        isCurrencyModalOpen.current = false;
        if (result.action !== ModalActions.CONFIRM || !policy) {
            return;
        }
        updatePolicyGeneralSettings(policy, policy.name, CONST.CURRENCY.USD);
        continueToggleFlow();
    };

    /**
     * Handle toggle change for Travel Billing.
     * When turning ON:
     *   - If has settlement account: call configureTravelBillingForPolicy
     *   - If no settlement account: navigate to selection (enable happens after selection)
     * When turning OFF: show confirmation modal, then call deactivateTravelBilling.
     */
    const handleToggle = (isEnabled: boolean) => {
        // Block toggling while a card-settings request is in flight here rather than through `disabled`, which would flash the lock icon on the toggle.
        if (isLoading) {
            return;
        }

        // Check if user is on a public domain - Travel Billing requires a private domain
        if (account?.isFromPublicDomain) {
            const hasPolicyIDInActiveRoute = getSearchParamFromPath(Navigation.getActiveRoute(), CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID) !== null;
            const dynamicSuffix = hasPolicyIDInActiveRoute ? DYNAMIC_ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.path : DYNAMIC_ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(policyID);
            Navigation.navigate(createDynamicRoute(dynamicSuffix));
            return;
        }

        if (!isEnabled) {
            // Trying to disable - check for outstanding balance first
            if (hasOutstandingBalance) {
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
        deactivateTravelBilling(policyID, defaultFundID);
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

    const getTravelBillingSubtitle = () => {
        if (!isTravelBillingEnabled) {
            return <TravelBillingSubtitleWrapper htmlComponent={<TravelBillingLearnHow />} />;
        }
        return <TravelBillingSubtitleWrapper />;
    };

    const getToggleDisabledAction = () => {
        if (!canWriteMoreFeatures) {
            return showReadOnlyModal;
        }
        if (isOnWaitlist) {
            return () => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
        }
        return undefined;
    };

    const travelBillingSubMenuItems = (
        <>
            {hasTravelProvisioningErrors && (
                <View style={styles.mt4}>
                    <FormHelpMessageRowWithRetryButton
                        message={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.provisioningError')}
                        size={CONST.BUTTON_SIZE.SMALL}
                        onRetry={() => retryTravelCardsProvisioning(policyID, defaultFundID, travelProvisioningErrors ?? {})}
                        variant={CONST.BUTTON_VARIANT.DANGER}
                        shouldAlignButtonToMessage
                    />
                </View>
            )}
            <View style={[styles.dFlex, styles.mt6, shouldStackButtons ? [styles.flexColumn, styles.gap3, styles.mb2] : [styles.flexRow, styles.gap4, styles.alignItemsCenter]]}>
                <View style={styles.flex1}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.currentTravelSpendLabel')}
                        title={formattedSpend}
                        wrapperStyle={[styles.sectionMenuItemTopDescription, (hasPendingSettlement || hasPendingInvoice) && styles.pb1]}
                        titleStyle={[styles.textNormalThemeText, styles.headerAnonymousFooter]}
                        descriptionTextStyle={styles.textLabelSupportingNormal}
                        interactive={false}
                    />
                    {hasPendingSettlement && (
                        <Text style={[styles.textLabelSupporting, styles.pb3]}>
                            {isPayByInvoice
                                ? translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.currentTravelSpendInvoiceQueued')
                                : translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.currentTravelSpendPaymentQueued', formattedQueuedAmount)}
                        </Text>
                    )}
                    {hasPendingInvoice && (
                        <Text style={[styles.textLabelSupporting, styles.pb3]}>
                            {translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.currentTravelSpendInvoicePending', formattedPendingInvoiceAmount)}
                        </Text>
                    )}
                </View>
                <View style={[styles.dFlex, styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                    <Button
                        onPress={handleViewOnSpend}
                        style={shouldStackButtons ? styles.flex1 : undefined}
                    >
                        <Button.Text>{translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.viewOnSpend')}</Button.Text>
                    </Button>
                    {shouldShowPayButton && canWriteMoreFeatures && (
                        <Button
                            onPress={handlePayBalance}
                            isDisabled={isOffline}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            style={shouldStackButtons ? styles.flex1 : undefined}
                        >
                            <Button.Text>{payBalanceCtaText}</Button.Text>
                        </Button>
                    )}
                </View>
            </View>
            <MenuItemWithTopDescription
                description={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.currentTravelLimitLabel')}
                title={formattedLimit}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
                titleStyle={styles.textNormalThemeText}
                descriptionTextStyle={styles.textLabelSupportingNormal}
                interactive={false}
            />
            <OfflineWithFeedback
                errors={settlementAccountErrors}
                pendingAction={settlementAccountPendingAction}
                onClose={() => clearTravelBillingSettlementAccountErrors(defaultFundID, travelSettings?.previousPaymentBankAccountID ?? null)}
                errorRowStyles={styles.mh2half}
                errorRowTextStyles={styles.mr3}
            >
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.settlementAccountLabel')}
                    title={settlementAccountNumber}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID))}
                    interactive={canWriteMoreFeatures}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    titleStyle={settlementAccountNumber ? styles.textNormalThemeText : styles.colorMuted}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    shouldShowRightIcon={canWriteMoreFeatures}
                    brickRoadIndicator={hasSettlementAccountError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback
                errors={settlementFrequencyErrors}
                pendingAction={cardSettings?.pendingFields?.monthlySettlementDate}
                onClose={() => clearTravelBillingSettlementFrequencyErrors(defaultFundID, travelSettings?.previousMonthlySettlementDate)}
                errorRowStyles={styles.mh2half}
                errorRowTextStyles={styles.mr3}
            >
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.settlementFrequencyLabel')}
                    title={localizedFrequency}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_FREQUENCY.getRoute(policyID))}
                    interactive={canWriteMoreFeatures}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    titleStyle={styles.textNormalThemeText}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    shouldShowRightIcon={canWriteMoreFeatures}
                    brickRoadIndicator={hasSettlementFrequencyError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback
                errors={monthlyLimitErrors}
                pendingAction={cardSettings?.pendingFields?.monthlySpendLimitPerUser}
                onClose={() => clearTravelBillingMonthlyLimitErrors(defaultFundID)}
                errorRowStyles={styles.mh2half}
                errorRowTextStyles={styles.mr3}
            >
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.monthlySpendLimitLabel')}
                    title={formattedMonthlyLimit}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_MONTHLY_LIMIT.getRoute(policyID))}
                    interactive={canWriteMoreFeatures}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    titleStyle={styles.textNormalThemeText}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    shouldShowRightIcon={canWriteMoreFeatures}
                    brickRoadIndicator={hasMonthlyLimitError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </>
    );

    return (
        <>
            <Section isCentralPane>
                <ToggleSettingOptionRow
                    title={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.title')}
                    titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle]}
                    subtitle={getTravelBillingSubtitle()}
                    switchAccessibilityLabel={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subtitle')}
                    onToggle={handleToggle}
                    isActive={isTravelBillingEnabled}
                    disabled={!canWriteMoreFeatures || isOnWaitlist}
                    disabledAction={getToggleDisabledAction()}
                    showLockIcon={!canWriteMoreFeatures || isOnWaitlist || hasOutstandingBalance}
                    pendingAction={togglePendingAction}
                    errors={toggleErrors}
                    onCloseError={() => clearTravelBillingErrors(defaultFundID)}
                    subMenuItems={travelBillingSubMenuItems}
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
                buttonVariant={CONST.BUTTON_VARIANT.DANGER}
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
                title={payBalanceModalTitle}
                isVisible={isPayBalanceModalVisible}
                onConfirm={handleConfirmPayBalance}
                onCancel={() => setIsPayBalanceModalVisible(false)}
                prompt={payBalanceModalBody}
                confirmText={payBalanceCtaText}
                cancelText={translate('common.cancel')}
                buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
            />
        </>
    );
}

export default WorkspaceTravelBillingSection;
