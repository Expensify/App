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
    clearCampfireErrorField,
    updateCampfireAutoSync,
    updateCampfireSyncExpensifyCardSettlements,
    updateCampfireSyncReimbursedReports,
    updateCampfireSyncTravelBillingSettlements,
} from '@libs/actions/connections/Campfire';
import {getCardSettings, isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import {getIsTravelBillingEnabled, getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

function CampfireAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
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
    const travelBillingFundID = useTravelBillingFundID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(travelBillingFundID));
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
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(policyID))}
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
                    <MenuItem.Root
                        onPress={callFunctionIfActionIsAllowed(
                            () => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPORT_METHOD.getRoute(policyID)) : undefined),
                            false,
                            session,
                        )}
                    >
                        <MenuItemField.Row
                            name={translate('workspace.campfire.accountingMethods.label')}
                            value={translate(`workspace.campfire.accountingMethods.values.${accountingMethod}`)}
                        >
                            {areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.ACCOUNTING_METHOD], campfireConfig?.errorFields) && (
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            )}
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        <MenuItem.HelpText message={translate(`workspace.campfire.accountingMethods.alternateText.${accountingMethod}`)} />
                    </MenuItem.Root>
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
                    <MenuItemField
                        name={translate('workspace.campfire.billPaymentAccount.label')}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_BILL_PAYMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                        value={billPaymentAccount ? `${billPaymentAccount?.id} ${billPaymentAccount?.name}` : undefined}
                    >
                        {areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.BILL_PAYMENT_ACCOUNT_ID], campfireConfig?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
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
                            <MenuItemField
                                name={translate('workspace.campfire.settlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={settlementsBankAccount ? `${settlementsBankAccount?.id} ${settlementsBankAccount?.name}` : undefined}
                            >
                                {areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], campfireConfig?.errorFields) && (
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
                        title={translate('workspace.campfire.syncTravelBillingSettlements')}
                        switchAccessibilityLabel={translate('workspace.campfire.syncTravelBillingSettlements')}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTravelInvoicingSettlements}
                        onToggle={() => policyID && updateCampfireSyncTravelBillingSettlements(policyID, !syncTravelInvoicingSettlements, syncTravelInvoicingSettlements)}
                        pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS], campfireConfig?.pendingFields)}
                        errors={getLatestErrorField(campfireConfig ?? {}, CONST.CAMPFIRE_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                        onCloseError={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncTravelInvoicingSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncTravelInvoicingSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], campfireConfig?.pendingFields)}>
                            <MenuItemField
                                name={translate('workspace.campfire.travelBillingSettlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_TRAVEL_BILLING_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={travelInvoicingSettlementsBankAccount ? `${travelInvoicingSettlementsBankAccount?.id} ${travelInvoicingSettlementsBankAccount?.name}` : undefined}
                            >
                                {areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], campfireConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                            </MenuItemField>
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], campfireConfig?.pendingFields)}>
                            <MenuItemField
                                name={translate('workspace.campfire.travelBillingPayableAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_TRAVEL_BILLING_PAYABLE_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={travelInvoicingPayableAccount ? `${travelInvoicingPayableAccount?.id} ${travelInvoicingPayableAccount?.name}` : undefined}
                            >
                                {areSettingsInErrorFields([CONST.CAMPFIRE_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], campfireConfig?.errorFields) && (
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

export default withPolicyConnections(CampfireAdvancedPage);
