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
    clearCampfireErrorField,
    updateCampfireAutoSync,
    updateCampfireSyncExpensifyCardSettlements,
    updateCampfireSyncReimbursedReports,
    updateCampfireSyncTravelInvoicingSettlements,
} from '@libs/actions/connections/Campfire';
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

function CampfireAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const autoSync = campfireConfig?.autoSync?.enabled ?? false;
    const accountingMethod = campfireConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const syncReimbursedReports = campfireConfig?.sync?.syncReimbursedReports ?? true;
    const billPaymentAccount = campfireData?.accounts?.find((account) => account.id === campfireConfig?.sync?.billPaymentAccountID);
    const syncExpensifyCardSettlements = campfireConfig?.sync?.syncExpensifyCardSettlements ?? true;
    const settlementsBankAccount = campfireData?.accounts?.find((account) => account.id === campfireConfig?.sync?.settlementsBankAccountID);
    const syncTravelInvoicingSettlements = campfireConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const travelInvoicingSettlementsBankAccount = campfireData?.accounts?.find((account) => account.id === campfireConfig?.sync?.travelInvoicingSettlementsBankAccountID);
    const travelInvoicingPayableAccount = campfireData?.accounts?.find((account) => account.id === campfireConfig?.export?.travelInvoicingPayableAccountID);
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
            displayName="CampfireAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            shouldBeBlocked
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.campfire.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={autoSync}
                onToggle={() => policyID && updateCampfireAutoSync(policyID, !autoSync, autoSync)}
                pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.AUTO_SYNC], campfireConfig?.pendingFields)}
                errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.AUTO_SYNC)}
                onCloseError={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.AUTO_SYNC)}
            />
            <Accordion
                isExpanded={isAutoSyncAccordionExpanded}
                isToggleTriggered={shouldAnimateAutoSyncAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.ACCOUNTING_METHOD], campfireConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={translate(`workspace.campfire.accountingMethods.values.${accountingMethod}`)}
                        description={translate('workspace.campfire.accountingMethods.label')}
                        hintText={translate(`workspace.campfire.accountingMethods.alternateText.${accountingMethod}`)}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPORT_METHOD.getRoute(policyID)) : undefined)}
                        shouldShowRightIcon
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.ACCOUNTING_METHOD], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            </Accordion>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.campfire.syncReimbursedReports')}
                subtitle={translate('workspace.campfire.syncReimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.campfire.syncReimbursedReports')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={syncReimbursedReports}
                onToggle={() => policyID && updateCampfireSyncReimbursedReports(policyID, !syncReimbursedReports, syncReimbursedReports)}
                pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.SYNC_REIMBURSED_REPORTS], campfireConfig?.pendingFields)}
                errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.SYNC_REIMBURSED_REPORTS)}
                onCloseError={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.SYNC_REIMBURSED_REPORTS)}
            />
            <Accordion
                isExpanded={isSyncReimbursedReportsAccordionExpanded}
                isToggleTriggered={shouldAnimateSyncReimbursedReportsAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.BILL_PAYMENT_ACCOUNT_ID], campfireConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={billPaymentAccount ? `${billPaymentAccount?.id} ${billPaymentAccount?.name}` : undefined}
                        description={translate('workspace.campfire.billPaymentAccount.label')}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_BILL_PAYMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                        shouldShowRightIcon
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.BILL_PAYMENT_ACCOUNT_ID], campfireConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            </Accordion>
            {isExpensifyCardsEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.campfire.syncExpensifyCardSettlements')}
                        switchAccessibilityLabel={translate('workspace.campfire.syncExpensifyCardSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncExpensifyCardSettlements}
                        onToggle={() => policyID && updateCampfireSyncExpensifyCardSettlements(policyID, !syncExpensifyCardSettlements, syncExpensifyCardSettlements)}
                        pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS], campfireConfig?.pendingFields)}
                        errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                        onCloseError={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncExpensifyCardSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncExpensifyCardSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], campfireConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={settlementsBankAccount ? `${settlementsBankAccount?.id} ${settlementsBankAccount?.name}` : undefined}
                                description={translate('workspace.campfire.settlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], campfireConfig?.errorFields)
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
                        title={translate('workspace.campfire.syncTravelInvoicingSettlements')}
                        switchAccessibilityLabel={translate('workspace.campfire.syncTravelInvoicingSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTravelInvoicingSettlements}
                        onToggle={() => policyID && updateCampfireSyncTravelInvoicingSettlements(policyID, !syncTravelInvoicingSettlements, syncTravelInvoicingSettlements)}
                        pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS], campfireConfig?.pendingFields)}
                        errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                        onCloseError={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncTravelInvoicingSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncTravelInvoicingSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], campfireConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={travelInvoicingSettlementsBankAccount ? `${travelInvoicingSettlementsBankAccount?.id} ${travelInvoicingSettlementsBankAccount?.name}` : undefined}
                                description={translate('workspace.campfire.travelInvoicingSettlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_TRAVEL_BILLING_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], campfireConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], campfireConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={travelInvoicingPayableAccount ? `${travelInvoicingPayableAccount?.id} ${travelInvoicingPayableAccount?.name}` : undefined}
                                description={translate('workspace.campfire.travelInvoicingPayableAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_TRAVEL_BILLING_PAYABLE_ACCOUNT.getRoute(policyID)) : undefined)}
                                shouldShowRightIcon
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], campfireConfig?.errorFields)
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

export default withPolicyConnections(CampfireAdvancedPage);
