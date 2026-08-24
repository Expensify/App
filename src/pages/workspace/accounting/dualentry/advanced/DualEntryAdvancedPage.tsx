import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {
    clearDualEntryErrorField,
    updateDualEntryAutoSync,
    updateDualEntrySyncExpensifyCardSettlements,
    updateDualEntrySyncReimbursedReports,
    updateDualEntrySyncTravelInvoicingSettlements,
} from '@libs/actions/connections/DualEntry';
import {getCardSettings, isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import {getIsTravelBillingEnabled, getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

function DualEntryAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const autoSync = dualentryConfig?.autoSync?.enabled ?? false;
    const accountingMethod = dualentryConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const syncReimbursedReports = dualentryConfig?.sync?.syncReimbursedReports ?? true;
    const billPaymentAccount = dualentryData?.accounts?.find((account) => account.id === dualentryConfig?.sync?.billPaymentAccountID);
    const syncExpensifyCardSettlements = dualentryConfig?.sync?.syncExpensifyCardSettlements ?? true;
    const settlementsBankAccount = dualentryData?.accounts?.find((account) => account.id === dualentryConfig?.sync?.settlementsBankAccountID);
    const syncTravelInvoicingSettlements = dualentryConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const travelInvoicingSettlementsBankAccount = dualentryData?.accounts?.find((account) => account.id === dualentryConfig?.sync?.travelInvoicingSettlementsBankAccountID);
    const travelInvoicingPayableAccount = dualentryData?.accounts?.find((account) => account.id === dualentryConfig?.export?.travelInvoicingPayableAccountID);
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(workspaceAccountID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);

    const {isAccordionExpanded: isAutoSyncAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateAutoSyncAccordionSection} = useAccordionAnimation(autoSync);
    const {isAccordionExpanded: isSyncReimbursedReportsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncReimbursedReportsAccordionSection} =
        useAccordionAnimation(syncReimbursedReports);
    const {isAccordionExpanded: isSyncExpensifyCardSettlementsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncExpensifyCardSettlementsAccordionSection} =
        useAccordionAnimation(syncExpensifyCardSettlements);
    const {isAccordionExpanded: isSyncTravelInvoicingSettlementsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncTravelInvoicingSettlementsAccordionSection} =
        useAccordionAnimation(syncTravelInvoicingSettlements);

    return (
        <ConnectionLayout
            displayName="DualEntryAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            shouldBeBlocked
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.dualEntry.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={autoSync}
                onToggle={() => policyID && updateDualEntryAutoSync(policyID, !autoSync, autoSync)}
                pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.AUTO_SYNC], dualentryConfig?.pendingFields)}
                errors={getLatestErrorField(dualentryConfig ?? {}, CONST.DUALENTRY_CONFIG.AUTO_SYNC)}
                onCloseError={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.AUTO_SYNC)}
            />
            <Accordion
                isExpanded={isAutoSyncAccordionExpanded}
                isToggleTriggered={shouldAnimateAutoSyncAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.ACCOUNTING_METHOD], dualentryConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={translate(`workspace.dualEntry.accountingMethods.values.${accountingMethod}`)}
                        description={translate('workspace.dualEntry.accountingMethods.label')}
                        hintText={translate(`workspace.dualEntry.accountingMethods.alternateText.${accountingMethod}`)}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPORT_METHOD.getRoute(policyID)) : undefined)}
                        shouldShowRightIcon
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.ACCOUNTING_METHOD], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            </Accordion>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.dualEntry.syncReimbursedReports')}
                subtitle={translate('workspace.dualEntry.syncReimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.dualEntry.syncReimbursedReports')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={syncReimbursedReports}
                onToggle={() => policyID && updateDualEntrySyncReimbursedReports(policyID, !syncReimbursedReports, syncReimbursedReports)}
                pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.SYNC_REIMBURSED_REPORTS], dualentryConfig?.pendingFields)}
                errors={getLatestErrorField(dualentryConfig ?? {}, CONST.DUALENTRY_CONFIG.SYNC_REIMBURSED_REPORTS)}
                onCloseError={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.SYNC_REIMBURSED_REPORTS)}
            />
            <Accordion
                isExpanded={isSyncReimbursedReportsAccordionExpanded}
                isToggleTriggered={shouldAnimateSyncReimbursedReportsAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.BILL_PAYMENT_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={billPaymentAccount ? `${billPaymentAccount?.id} ${billPaymentAccount?.name}` : undefined}
                        description={translate('workspace.dualEntry.billPaymentAccount.label')}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_BILL_PAYMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                        shouldShowRightIcon
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.BILL_PAYMENT_ACCOUNT_ID], dualentryConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            </Accordion>
            {isExpensifyCardsEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.dualEntry.syncExpensifyCardSettlements')}
                        switchAccessibilityLabel={translate('workspace.dualEntry.syncExpensifyCardSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncExpensifyCardSettlements}
                        onToggle={() => policyID && updateDualEntrySyncExpensifyCardSettlements(policyID, !syncExpensifyCardSettlements, syncExpensifyCardSettlements)}
                        pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS], dualentryConfig?.pendingFields)}
                        errors={getLatestErrorField(dualentryConfig ?? {}, CONST.DUALENTRY_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                        onCloseError={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncExpensifyCardSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncExpensifyCardSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={settlementsBankAccount ? `${settlementsBankAccount?.id} ${settlementsBankAccount?.name}` : undefined}
                                description={translate('workspace.dualEntry.settlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], dualentryConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
            {isTravelBillingEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.dualEntry.syncTravelInvoicingSettlements')}
                        switchAccessibilityLabel={translate('workspace.dualEntry.syncTravelInvoicingSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTravelInvoicingSettlements}
                        onToggle={() => policyID && updateDualEntrySyncTravelInvoicingSettlements(policyID, !syncTravelInvoicingSettlements, syncTravelInvoicingSettlements)}
                        pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS], dualentryConfig?.pendingFields)}
                        errors={getLatestErrorField(dualentryConfig ?? {}, CONST.DUALENTRY_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                        onCloseError={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncTravelInvoicingSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncTravelInvoicingSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={travelInvoicingSettlementsBankAccount ? `${travelInvoicingSettlementsBankAccount?.id} ${travelInvoicingSettlementsBankAccount?.name}` : undefined}
                                description={translate('workspace.dualEntry.travelInvoicingSettlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_TRAVEL_BILLING_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], dualentryConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={travelInvoicingPayableAccount ? `${travelInvoicingPayableAccount?.id} ${travelInvoicingPayableAccount?.name}` : undefined}
                                description={translate('workspace.dualEntry.travelInvoicingPayableAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_TRAVEL_BILLING_PAYABLE_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], dualentryConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DualEntryAdvancedPage);
