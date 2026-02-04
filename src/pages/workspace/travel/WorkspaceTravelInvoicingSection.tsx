import React, {useState} from 'react';
import {View} from 'react-native';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import ConfirmModal from '@components/ConfirmModal';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {openExternalLink} from '@libs/actions/Link';
import {clearToggleTravelInvoicingErrors, clearTravelInvoicingSettlementAccountErrors, toggleTravelInvoicing} from '@libs/actions/TravelInvoicing';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import {getEligibleBankAccountsForCard} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
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
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';
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
    const {isExecuting, singleExecution} = useSingleExecution();
    const icons = useMemoizedLazyExpensifyIcons(['LuggageWithLines', 'NewWindow']);

    // Modal states
    const [isDisableConfirmModalVisible, setIsDisableConfirmModalVisible] = useState(false);
    const [isOutstandingBalanceModalVisible, setIsOutstandingBalanceModalVisible] = useState(false);

    // For Travel Invoicing, we use a travel-specific card settings key
    // The format is: private_expensifyCardSettings_{workspaceAccountID}_{feedType}
    // where feedType is PROGRAM_TRAVEL_US for Travel Invoicing
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID), {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});

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

    // Check if toggle is loading or has pending action
    const isLoading = cardSettings?.isLoading ?? false;

    // Format currency values (assuming USD for Travel Invoicing based on PROGRAM_TRAVEL_US)
    const formattedSpend = convertToDisplayString(travelSpend, CONST.CURRENCY.USD);
    const formattedLimit = convertToDisplayString(travelLimit, CONST.CURRENCY.USD);

    // Settlement account display - show empty if no account is selected
    const settlementAccountNumber = hasSettlementAccount && settlementAccount?.last4 ? `${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(settlementAccount?.last4 ?? '')}` : '';

    // Differentiate toggle errors from settlement account errors based on pendingAction
    // Toggle actions use ADD or DELETE pendingAction, settlement account uses UPDATE
    const isTogglePendingAction =
        cardSettings?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || cardSettings?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isSettlementAccountPendingAction = cardSettings?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    // Only show errors/pending under the toggle if it's a toggle action
    const toggleErrors = isTogglePendingAction ? cardSettings?.errors : undefined;
    const togglePendingAction = isTogglePendingAction ? cardSettings?.pendingAction : undefined;

    // Only show errors/pending under the settlement account if it's a settlement account action
    // IMPORTANT: Don't show settlement account errors during toggle operations
    const settlementAccountErrors = isSettlementAccountPendingAction ? cardSettings?.errors : undefined;
    const settlementAccountPendingAction = isSettlementAccountPendingAction ? cardSettings?.pendingAction : undefined;
    // Only show error indicator if we have settlement account errors AND it's not a toggle operation
    const hasSettlementAccountError = !isTogglePendingAction && isSettlementAccountPendingAction && Object.keys(cardSettings?.errors ?? {}).length > 0;

    // Bank account eligibility for toggle handler
    const isSetupUnfinished = hasInProgressUSDVBBA(reimbursementAccount?.achData);
    const eligibleBankAccounts = getEligibleBankAccountsForCard(bankAccountList);

    // Determine if Travel Invoicing is enabled based on settings object existence
    const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(cardSettings);

    /**
     * Handle toggle change for Central Invoicing.
     * When turning ON, calls toggleTravelInvoicing(true) first to provision domain, then navigates to settlement account.
     * When turning OFF, shows confirmation modal and then clears settings via toggleTravelInvoicing.
     */
    const handleToggle = (isEnabled: boolean) => {
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

        // Check if user is on a public domain - Travel Invoicing requires a private domain
        if (account?.isFromPublicDomain) {
            Navigation.navigate(ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(Navigation.getActiveRoute()));
            return;
        }

        // Turning ON - check if bank account setup is needed
        if (!eligibleBankAccounts.length || isSetupUnfinished) {
            // No bank accounts - start add bank account flow
            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW, ROUTES.WORKSPACE_TRAVEL.getRoute(policyID)));
            return;
        }

        // Bank accounts exist - navigate to settlement account selection
        // toggleTravelInvoicing(true) will be called after account is selected
        // (backend requires settlement account to be set before enabling)
        Navigation.navigate(ROUTES.WORKSPACE_TRAVEL_SETTINGS_ACCOUNT.getRoute(policyID));
    };

    /**
     * Confirm disable action - clears settings via toggleTravelInvoicing
     */
    const handleConfirmDisable = () => {
        setIsDisableConfirmModalVisible(false);
        toggleTravelInvoicing(policyID, workspaceAccountID, false);
    };

    const getCentralInvoicingSubtitle = () => {
        if (!hasSettlementAccount) {
            return <CentralInvoicingSubtitleWrapper htmlComponent={<CentralInvoicingLearnHow />} />;
        }
        return <CentralInvoicingSubtitleWrapper />;
    };

    const optionItems: ToggleSettingOptionRowProps[] = [
        {
            title: translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.title'),
            subtitle: getCentralInvoicingSubtitle(),
            switchAccessibilityLabel: translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subtitle'),
            isActive: isTravelInvoicingEnabled,
            onToggle: handleToggle,
            disabled: isLoading,
            pendingAction: togglePendingAction,
            errors: toggleErrors,
            onCloseError: () => clearToggleTravelInvoicingErrors(workspaceAccountID),
            subMenuItems: (
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
                            // brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                        <View style={[styles.wFitContent]}>
                            <AnimatedSubmitButton
                                text={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.currentTravelSpendCta')}
                                success={false}
                                onPress={() => {}}
                                isSubmittingAnimationRunning={false}
                                onAnimationFinish={() => {}}
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
                        // brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
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
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.settlementFrequencyLabel')}
                        title={localizedFrequency}
                        onPress={() => {}}
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                        titleStyle={styles.textNormalThemeText}
                        descriptionTextStyle={styles.textLabelSupportingNormal}
                        shouldShowRightIcon
                        // brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </>
            ),
        },
    ];

    const renderOptionItem = (item: ToggleSettingOptionRowProps, index: number) => (
        <Section
            key={`toggleSettingOptionItem-${index}`}
            isCentralPane
        >
            <ToggleSettingOptionRow
                title={item.title}
                titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle]}
                subtitle={item.subtitle}
                switchAccessibilityLabel={item.switchAccessibilityLabel}
                onToggle={item.onToggle}
                disabled={item.disabled}
                isActive={item.isActive}
                pendingAction={item.pendingAction}
                errors={item.errors}
                onCloseError={item.onCloseError}
                subMenuItems={item.subMenuItems}
            />
        </Section>
    );

    return (
        <>
            <Section
                title={translate('workspace.moreFeatures.travel.travelInvoicing.travelBookingSection.title')}
                subtitle={translate('workspace.moreFeatures.travel.travelInvoicing.travelBookingSection.subtitle')}
                subtitleStyles={styles.mb6}
                isCentralPane
                subtitleMuted
            >
                <MenuItem
                    title={translate('workspace.moreFeatures.travel.travelInvoicing.travelBookingSection.manageTravelLabel')}
                    onPress={singleExecution(() => openExternalLink(CONST.FOOTER.TRAVEL_URL))}
                    disabled={isExecuting}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    iconRight={icons.NewWindow}
                    icon={icons.LuggageWithLines}
                    shouldShowRightIcon
                />
            </Section>
            {optionItems.map(renderOptionItem)}

            {/* Confirmation modal for disabling Travel Invoicing */}
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

            {/* Blocker modal for outstanding balance */}
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
