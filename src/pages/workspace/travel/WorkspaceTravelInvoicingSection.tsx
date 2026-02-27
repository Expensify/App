import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import ConfirmModal from '@components/ConfirmModal';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {
    clearToggleTravelInvoicingErrors,
    clearTravelInvoicingSettlementAccountErrors,
    clearTravelInvoicingSettlementFrequencyErrors,
    toggleTravelInvoicing,
} from '@libs/actions/TravelInvoicing';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
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
    const {translate} = useLocalize();
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    // Modal states
    const [isDisableConfirmModalVisible, setIsDisableConfirmModalVisible] = useState(false);
    const [isOutstandingBalanceModalVisible, setIsOutstandingBalanceModalVisible] = useState(false);

    // Ref to track if we should auto-resume the toggle flow after returning from TravelLegalNamePage
    const shouldResumeToggleRef = useRef(false);

    // For Travel Invoicing, we use a travel-specific card settings key
    // Uses the same key pattern as Expensify Card: private_expensifyCardSettings_{workspaceAccountID}
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    // Use pure selectors to derive state
    const hasSettlementAccount = hasTravelInvoicingSettlementAccount(cardSettings);
    const travelSpend = getTravelSpend(cardSettings);
    const travelLimit = getTravelLimit(cardSettings);
    const settlementAccount = getTravelSettlementAccount(cardSettings, bankAccountList);
    const settlementFrequency = getTravelSettlementFrequency(cardSettings);
    const localizedFrequency =
        settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY
            ? translate('workspace.expensifyCard.frequency.monthly')
            : translate('workspace.expensifyCard.frequency.daily');

    // Format currency values (assuming USD for Travel Invoicing based on PROGRAM_TRAVEL_US)
    const formattedSpend = convertToDisplayString(travelSpend, CONST.CURRENCY.USD);
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

    // Bank account eligibility for toggle handler
    const isSetupUnfinished = hasInProgressUSDVBBA(reimbursementAccount?.achData);
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountList);

    // Determine if Travel Invoicing is enabled based on isEnabled field
    const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(cardSettings);

    /**
     * Handle toggle change for Central Invoicing.
     * When turning ON:
     *   - If has settlement account: call toggleTravelInvoicing(true)
     *   - If no settlement account: navigate to selection (enable happens after selection)
     * When turning OFF: show confirmation modal, then call toggleTravelInvoicing(false).
     */
    const handleToggle = (isEnabled: boolean) => {
        // Check if user is on a public domain - Travel Invoicing requires a private domain
        if (account?.isFromPublicDomain) {
            Navigation.navigate(ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (!isEnabled) {
            // Trying to disable - check for outstanding balance first
            if (hasOutstandingTravelBalance(cardSettings)) {
                // Show blocker modal with error message
                setIsOutstandingBalanceModalVisible(true);
                return;
            }
            // Show confirmation modal before disabling
            setIsDisableConfirmModalVisible(true);
            return;
        }

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

        // Has settlement account - enable Travel Invoicing directly
        toggleTravelInvoicing(policyID, workspaceAccountID, true);
    };

    const handleConfirmDisable = () => {
        setIsDisableConfirmModalVisible(false);
        toggleTravelInvoicing(policyID, workspaceAccountID, false);
    };

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
            <View style={[styles.dFlex, styles.flexRow, styles.mt6, styles.gap4, styles.alignItemsCenter]}>
                <MenuItemWithTopDescription
                    description={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelSpendLabel')}
                    title={formattedSpend}
                    rootWrapperStyle={styles.flex1}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    titleStyle={[styles.textNormalThemeText, styles.headerAnonymousFooter]}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    interactive={false}
                />
                <View style={[styles.wFitContent]}>
                    <AnimatedSubmitButton
                        text={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelSpendCta')}
                        success={false}
                        onPress={() => {}}
                        isSubmittingAnimationRunning={false}
                        onAnimationFinish={() => {}}
                        // TODO: Release 7.2 - Pay balance
                        // isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                        // onAnimationFinish={stopAnimation}
                        // isDisabled={shouldBlockSubmit}
                    />
                </View>
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
                onClose={() => clearTravelInvoicingSettlementAccountErrors(workspaceAccountID, cardSettings?.previousPaymentBankAccountID ?? null)}
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
                onClose={() => clearTravelInvoicingSettlementFrequencyErrors(workspaceAccountID, cardSettings?.previousMonthlySettlementDate)}
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
                    pendingAction={togglePendingAction}
                    errors={toggleErrors}
                    onCloseError={() => clearToggleTravelInvoicingErrors(workspaceAccountID)}
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
        </>
    );
}

export default WorkspaceTravelInvoicingSection;
