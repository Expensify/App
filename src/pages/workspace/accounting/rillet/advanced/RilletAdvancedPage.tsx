import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearRilletErrorField} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function RilletAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const autoSync = rilletConfig?.autoSync?.enabled ?? true;
    const accountingMethod = rilletConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const syncReimbursedReports = rilletConfig?.sync?.syncReimbursedReports ?? true;
    const billPaymentAccount = rilletData?.accounts?.find((account) => account.code === rilletConfig?.sync?.billPaymentAccountCode);
    const syncExpensifyCardSettlements = rilletConfig?.sync?.syncExpensifyCardSettlements ?? true;
    const settlementsBankAccount = rilletData?.bankAccounts?.find((bankAccount) => bankAccount.id === rilletConfig?.sync?.settlementsBankAccountID);
    const syncTravelInvoicingSettlements = rilletConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const travelInvoicingSettlementsBankAccount = rilletData?.bankAccounts?.find((bankAccount) => bankAccount.id === rilletConfig?.sync?.travelInvoicingSettlementsBankAccountID);
    const isExpensifyCardsEnabled = true; // s77rt
    const isTravelInvoicingEnabled = true; // s77rt
    // s77rt use Accordion

    return (
        <ConnectionLayout
            displayName="RilletAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            shouldBeBlocked
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.rillet.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={autoSync}
                onToggle={() => policyID && updateRilletAutoSync(policyID, !autoSync, autoSync)}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.AUTO_SYNC], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.AUTO_SYNC)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.AUTO_SYNC)}
            />
            {autoSync && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.ACCOUNTING_METHOD], rilletConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={translate(`workspace.rillet.accountingMethods.values.${accountingMethod}`)}
                        description={translate('workspace.rillet.accountingMethods.label')}
                        hintText={translate(`workspace.rillet.accountingMethods.alternateText.${accountingMethod}`)}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT_METHOD.getRoute(policyID)) : undefined)}
                        shouldShowRightIcon
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.RILLET_CONFIG.ACCOUNTING_METHOD], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            )}
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.rillet.syncReimbursedReports')}
                subtitle={translate('workspace.rillet.syncReimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.rillet.syncReimbursedReports')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={syncReimbursedReports}
                onToggle={() => policyID && updateRilletSyncReimbursedReports(policyID, !syncReimbursedReports, syncReimbursedReports)}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SYNC_REIMBURSED_REPORTS], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.SYNC_REIMBURSED_REPORTS)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.SYNC_REIMBURSED_REPORTS)}
            />
            {syncReimbursedReports && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.BILL_PAYMENT_ACCOUNT_CODE], rilletConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={billPaymentAccount?.name}
                        description={translate('workspace.rillet.billPaymentAccount.label')}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_BILL_PAYMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                        shouldShowRightIcon
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.RILLET_CONFIG.BILL_PAYMENT_ACCOUNT_CODE], rilletConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            )}
            {isExpensifyCardsEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.rillet.syncExpensifyCardSettlements')}
                        switchAccessibilityLabel={translate('workspace.rillet.syncExpensifyCardSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncExpensifyCardSettlements}
                        onToggle={() => policyID && updateRilletSyncExpensifyCardSettlements(policyID, !syncExpensifyCardSettlements, syncExpensifyCardSettlements)}
                        pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS], rilletConfig?.pendingFields)}
                        errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                        onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                    />
                    {syncExpensifyCardSettlements && (
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], rilletConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={settlementsBankAccount?.name}
                                description={translate('workspace.rillet.settlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.RILLET_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], rilletConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    )}
                </>
            )}
            {isTravelInvoicingEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.rillet.syncTravelInvoicingSettlements')}
                        switchAccessibilityLabel={translate('workspace.rillet.syncTravelInvoicingSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTravelInvoicingSettlements}
                        onToggle={() => policyID && updateRilletSyncTravelInvoicingSettlements(policyID, !syncTravelInvoicingSettlements, syncTravelInvoicingSettlements)}
                        pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS], rilletConfig?.pendingFields)}
                        errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS)}
                        onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.SYNC_TRAVEL_INVOICING_SETTLEMENTS)}
                    />
                    {syncTravelInvoicingSettlements && (
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID], rilletConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={travelInvoicingSettlementsBankAccount?.name}
                                description={translate('workspace.rillet.travelInvoicingSettlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_TRAVEL_INVOICING_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.RILLET_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID], rilletConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    )}
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(RilletAdvancedPage);
