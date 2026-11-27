/**
 * The Digits Advanced settings: auto-sync and its export method, Sync reimbursed reports with its bill payment account,
 * and the Expensify Card and Consolidated Travel Billing settlement syncs with their accounts. Each settlement sync only
 * shows when the workspace has that feature.
 */
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useTravelBillingFundID from '@hooks/useTravelBillingFundID';

import {
    clearDigitsErrorField,
    updateDigitsAutoSync,
    updateDigitsSyncExpensifyCardSettlements,
    updateDigitsSyncReimbursedReports,
    updateDigitsSyncTravelBillingSettlements,
} from '@libs/actions/connections/Digits';
import {getCardSettings, isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import {getIsTravelBillingEnabled, getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

import type {DigitsSettlementAccountLabel} from './DigitsAdvancedAccountUtils';

import {getDigitsBankAccount, getDigitsExpensifyCardSettlementMissingAccountLabel, getDigitsTravelBillingSettlementMissingAccountLabel} from './DigitsAdvancedAccountUtils';

function DigitsAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const digitsData = policy?.connections?.digits?.data;
    const autoSync = digitsConfig?.autoSync?.enabled ?? false;
    const accountingMethod = digitsConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const syncReimbursedReports = digitsConfig?.sync?.syncReimbursedReports ?? true;
    const billPaymentAccount = getDigitsBankAccount(policy, digitsConfig?.sync?.billPaymentAccountID);
    const syncExpensifyCardSettlements = digitsConfig?.sync?.syncExpensifyCardSettlements ?? true;
    const settlementsBankAccount = getDigitsBankAccount(policy, digitsConfig?.sync?.settlementsBankAccountID);
    const syncTravelInvoicingSettlements = digitsConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const travelBillingSettlementsBankAccount = getDigitsBankAccount(policy, digitsConfig?.sync?.travelInvoicingSettlementsBankAccountID);
    const travelBillingPayableAccount = digitsData?.accounts?.find((account) => account.id === digitsConfig?.export?.travelInvoicingPayableAccountID);
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const travelBillingFundID = useTravelBillingFundID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(travelBillingFundID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);

    // A settlement sync that's on but can't find one of its accounts doesn't run, so its toggle names the account to choose
    const getMissingSettlementAccountMessage = (isSyncEnabled: boolean, missingAccountLabel: DigitsSettlementAccountLabel | undefined) =>
        isSyncEnabled && missingAccountLabel ? translate('workspace.digits.missingSettlementAccount', translate(missingAccountLabel)) : undefined;
    const expensifyCardSettlementMessage = getMissingSettlementAccountMessage(syncExpensifyCardSettlements, getDigitsExpensifyCardSettlementMissingAccountLabel(policy));
    const travelBillingSettlementMessage = getMissingSettlementAccountMessage(syncTravelInvoicingSettlements, getDigitsTravelBillingSettlementMissingAccountLabel(policy));

    const {isAccordionExpanded: isAutoSyncAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateAutoSyncAccordionSection} = useAccordionAnimation(autoSync);
    const {isAccordionExpanded: isSyncReimbursedReportsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncReimbursedReportsAccordionSection} =
        useAccordionAnimation(syncReimbursedReports);
    const {isAccordionExpanded: isSyncExpensifyCardSettlementsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncExpensifyCardSettlementsAccordionSection} =
        useAccordionAnimation(syncExpensifyCardSettlements);
    const {isAccordionExpanded: isSyncTravelBillingSettlementsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncTravelBillingSettlementsAccordionSection} =
        useAccordionAnimation(syncTravelInvoicingSettlements);

    return (
        <ConnectionLayout
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(policyID))}
            displayName="DigitsAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            shouldBeBlocked
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.digits.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.AUTO_SYNC_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={autoSync}
                onToggle={() => policyID && updateDigitsAutoSync(policyID, !autoSync, autoSync)}
                pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.AUTO_SYNC], digitsConfig?.pendingFields)}
                errors={getLatestErrorField(digitsConfig ?? {}, CONST.DIGITS_CONFIG.AUTO_SYNC)}
                onCloseError={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.AUTO_SYNC)}
            />
            <Accordion
                isExpanded={isAutoSyncAccordionExpanded}
                isToggleTriggered={shouldAnimateAutoSyncAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.ACCOUNTING_METHOD], digitsConfig?.pendingFields)}>
                    <MenuItem.Root
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.ACCOUNTING_METHOD}
                        onPress={callIfAuthenticated(() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_EXPORT_METHOD.getRoute(policyID)) : undefined), session)}
                    >
                        <MenuItemField.Row
                            name={translate('workspace.digits.accountingMethods.label')}
                            value={translate(`workspace.digits.accountingMethods.values.${accountingMethod}`)}
                        >
                            {areSettingsInErrorFields([CONST.DIGITS_CONFIG.ACCOUNTING_METHOD], digitsConfig?.errorFields) && (
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            )}
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        <MenuItem.HelpText message={translate(`workspace.digits.accountingMethods.alternateText.${accountingMethod}`)} />
                    </MenuItem.Root>
                </OfflineWithFeedback>
            </Accordion>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.digits.syncReimbursedReports')}
                subtitle={translate('workspace.digits.syncReimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.digits.syncReimbursedReports')}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.SYNC_REIMBURSED_REPORTS_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={syncReimbursedReports}
                onToggle={() => policyID && updateDigitsSyncReimbursedReports(policyID, !syncReimbursedReports, syncReimbursedReports)}
                pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.SYNC_REIMBURSED_REPORTS], digitsConfig?.pendingFields)}
                errors={getLatestErrorField(digitsConfig ?? {}, CONST.DIGITS_CONFIG.SYNC_REIMBURSED_REPORTS)}
                onCloseError={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.SYNC_REIMBURSED_REPORTS)}
            />
            <Accordion
                isExpanded={isSyncReimbursedReportsAccordionExpanded}
                isToggleTriggered={shouldAnimateSyncReimbursedReportsAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.BILL_PAYMENT_ACCOUNT_ID], digitsConfig?.pendingFields)}>
                    <MenuItemField
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.BILL_PAYMENT_ACCOUNT}
                        name={translate('workspace.digits.billPaymentAccount.label')}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_BILL_PAYMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                        value={billPaymentAccount?.name}
                    >
                        {areSettingsInErrorFields([CONST.DIGITS_CONFIG.BILL_PAYMENT_ACCOUNT_ID], digitsConfig?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            </Accordion>
            {isExpensifyCardsEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.digits.syncExpensifyCardSettlements')}
                        subtitle={expensifyCardSettlementMessage}
                        switchAccessibilityLabel={translate('workspace.digits.syncExpensifyCardSettlements')}
                        switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.SYNC_EXPENSIFY_CARD_SETTLEMENTS_SWITCH}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncExpensifyCardSettlements}
                        onToggle={() => policyID && updateDigitsSyncExpensifyCardSettlements(policyID, !syncExpensifyCardSettlements, syncExpensifyCardSettlements)}
                        pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS], digitsConfig?.pendingFields)}
                        errors={getLatestErrorField(digitsConfig ?? {}, CONST.DIGITS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                        onCloseError={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncExpensifyCardSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncExpensifyCardSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], digitsConfig?.pendingFields)}>
                            <MenuItemField
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.SETTLEMENT_ACCOUNT}
                                name={translate('workspace.digits.settlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={settlementsBankAccount?.name}
                            >
                                {areSettingsInErrorFields([CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], digitsConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                            </MenuItemField>
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
            {isTravelBillingEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.digits.syncTravelBillingSettlements')}
                        subtitle={travelBillingSettlementMessage}
                        switchAccessibilityLabel={translate('workspace.digits.syncTravelBillingSettlements')}
                        switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.SYNC_TRAVEL_BILLING_SETTLEMENTS_SWITCH}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTravelInvoicingSettlements}
                        onToggle={() => policyID && updateDigitsSyncTravelBillingSettlements(policyID, !syncTravelInvoicingSettlements, syncTravelInvoicingSettlements)}
                        pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS], digitsConfig?.pendingFields)}
                        errors={getLatestErrorField(digitsConfig ?? {}, CONST.DIGITS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                        onCloseError={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncTravelBillingSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncTravelBillingSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], digitsConfig?.pendingFields)}>
                            <MenuItemField
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.TRAVEL_BILLING_SETTLEMENT_ACCOUNT}
                                name={translate('workspace.digits.travelBillingSettlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_TRAVEL_BILLING_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={travelBillingSettlementsBankAccount?.name}
                            >
                                {areSettingsInErrorFields([CONST.DIGITS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], digitsConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                            </MenuItemField>
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], digitsConfig?.pendingFields)}>
                            <MenuItemField
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.TRAVEL_BILLING_PAYABLE_ACCOUNT}
                                name={translate('workspace.digits.travelBillingPayableAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DIGITS_TRAVEL_BILLING_PAYABLE_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={travelBillingPayableAccount?.name}
                            >
                                {areSettingsInErrorFields([CONST.DIGITS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], digitsConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                            </MenuItemField>
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DigitsAdvancedPage);
