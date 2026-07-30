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
import {getIsTravelInvoicingEnabled, getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';

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
    const dualentryConfig = policy?.connections?.dualentry?.config;
    const dualentryData = policy?.connections?.dualentry?.data;
    const autoSync = dualentryConfig?.autoSync?.enabled ?? true;
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
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelInvoicingEnabled = getIsTravelInvoicingEnabled(travelSettings);

    const {isAccordionExpanded: isAutoSyncAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateAutoSyncAccordionSection} = useAccordionAnimation(autoSync);
    const {isAccordionExpanded: isSyncReimbursedReportsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncReimbursedReportsAccordionSection} =
        useAccordionAnimation(syncReimbursedReports);
    const {isAccordionExpanded: isSyncExpensifyCardSettlementsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncExpensifyCardSettlementsAccordionSection} =
        useAccordionAnimation(syncExpensifyCardSettlements);
    const {isAccordionExpanded: isSyncTravelInvoicingSettlementsAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateSyncTravelInvoicingSettlementsAccordionSection} =
        useAccordionAnimation(syncTravelInvoicingSettlements);

    // s77rt TODO: Confirm why the ExpensifyCard/TI settlements require an explicit `export.expensifyCardAccountID`
    // BUG Found with the documented approach, if user has only one account, then expensifyCardAccountID would fallback to creditCardAccountID
    // and now the user can do nothing to explicitly set expensifyCardAccountID because in the UI it appears as set already (and setting same value does nothing)
    // Options:
    // 1. Do not require the explicit expensifyCardAccountID and have BE fallback to creditCardAccountID too
    // 2. Do not fallback expensifyCardAccountID and make expensifyCardAccountID value explicit to export.expensifyCardAccountID (and not expensifyCardAccountID ?? creditCardAccountID)
    // 3. Update UI to differentiate between whether the ExpensifyCard account is set from explicit expensifyCardAccountID or using the fallback creditCardAccountID

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
                subtitle={translate('workspace.dualentry.autoSyncDescription')}
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
                        title={translate(`workspace.dualentry.accountingMethods.values.${accountingMethod}`)}
                        description={translate('workspace.dualentry.accountingMethods.label')}
                        hintText={translate(`workspace.dualentry.accountingMethods.alternateText.${accountingMethod}`)}
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
                title={translate('workspace.dualentry.syncReimbursedReports')}
                subtitle={translate('workspace.dualentry.syncReimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.dualentry.syncReimbursedReports')}
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
                        description={translate('workspace.dualentry.billPaymentAccount.label')}
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
                        title={translate('workspace.dualentry.syncExpensifyCardSettlements')}
                        switchAccessibilityLabel={translate('workspace.dualentry.syncExpensifyCardSettlements')}
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
                                description={translate('workspace.dualentry.settlementAccount.label')}
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
            {isTravelInvoicingEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.dualentry.syncTravelInvoicingSettlements')}
                        switchAccessibilityLabel={translate('workspace.dualentry.syncTravelInvoicingSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTravelInvoicingSettlements}
                        onToggle={() => policyID && updateDualEntrySyncTravelInvoicingSettlements(policyID, !syncTravelInvoicingSettlements, syncTravelInvoicingSettlements)}
                        pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS], dualentryConfig?.pendingFields)}
                        errors={getLatestErrorField(dualentryConfig ?? {}, CONST.DUALENTRY_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS)}
                        onCloseError={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncTravelInvoicingSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncTravelInvoicingSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={travelInvoicingSettlementsBankAccount ? `${travelInvoicingSettlementsBankAccount?.id} ${travelInvoicingSettlementsBankAccount?.name}` : undefined}
                                description={translate('workspace.dualentry.travelInvoicingSettlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_TRAVEL_INVOICING_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID], dualentryConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT_ID], dualentryConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={travelInvoicingPayableAccount ? `${travelInvoicingPayableAccount?.id} ${travelInvoicingPayableAccount?.name}` : undefined}
                                description={translate('workspace.dualentry.travelInvoicingPayableAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_TRAVEL_INVOICING_PAYABLE_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.DUALENTRY_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT_ID], dualentryConfig?.errorFields)
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
