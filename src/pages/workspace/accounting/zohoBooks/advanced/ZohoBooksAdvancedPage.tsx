/**
 * Zoho Books advanced settings: auto sync with its export method, reimbursed report sync with the bill payment account,
 * and Expensify Card and Consolidated Travel Billing settlement sync with their workspace-level accounts.
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
    clearZohoBooksErrorField,
    updateZohoBooksAutoSync,
    updateZohoBooksSyncExpensifyCardSettlements,
    updateZohoBooksSyncReimbursedReports,
    updateZohoBooksSyncTravelBillingSettlements,
} from '@libs/actions/connections/ZohoBooks';
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

function ZohoBooksAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const autoSync = zohoBooksConfig?.autoSync?.enabled ?? false;
    const accountingMethod = zohoBooksConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const syncReimbursedReports = zohoBooksConfig?.sync?.syncReimbursedReports ?? true;
    const billPaymentAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === zohoBooksConfig?.sync?.billPaymentAccountID);
    const syncExpensifyCardSettlements = zohoBooksConfig?.sync?.syncExpensifyCardSettlements ?? true;
    const settlementsBankAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === zohoBooksConfig?.sync?.settlementsBankAccountID);
    const syncTravelInvoicingSettlements = zohoBooksConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const travelInvoicingSettlementsBankAccount = zohoBooksData?.bankAccounts?.find((account) => account.id === zohoBooksConfig?.sync?.travelInvoicingSettlementsBankAccountID);
    const travelInvoicingPayableAccount = zohoBooksData?.accounts?.find((account) => account.id === zohoBooksConfig?.export?.travelInvoicingPayableAccountID);
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
            displayName="ZohoBooksAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            shouldBeBlocked
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.autoSync')}
                subtitle={translate('workspace.zohoBooks.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.autoSync')}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.ZOHO_BOOKS.AUTO_SYNC_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={autoSync}
                onToggle={() => policyID && updateZohoBooksAutoSync(policyID, !autoSync, autoSync)}
                pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC], zohoBooksConfig?.pendingFields)}
                errors={getLatestErrorField(zohoBooksConfig ?? {}, CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC)}
                onCloseError={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.AUTO_SYNC)}
            />
            <Accordion
                isExpanded={isAutoSyncAccordionExpanded}
                isToggleTriggered={shouldAnimateAutoSyncAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.ACCOUNTING_METHOD], zohoBooksConfig?.pendingFields)}>
                    <MenuItem.Root
                        onPress={callFunctionIfActionIsAllowed(
                            () => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXPORT_METHOD.getRoute(policyID)) : undefined),
                            false,
                            session,
                        )}
                    >
                        <MenuItemField.Row
                            name={translate('workspace.zohoBooks.accountingMethods.label')}
                            value={translate(`workspace.zohoBooks.accountingMethods.values.${accountingMethod}`)}
                        >
                            {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.ACCOUNTING_METHOD], zohoBooksConfig?.errorFields) && (
                                <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                            )}
                            <MenuItem.Chevron />
                        </MenuItemField.Row>
                        <MenuItem.HelpText message={translate(`workspace.zohoBooks.accountingMethods.alternateText.${accountingMethod}`)} />
                    </MenuItem.Root>
                </OfflineWithFeedback>
            </Accordion>
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.zohoBooks.syncReimbursedReports')}
                subtitle={translate('workspace.zohoBooks.syncReimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.zohoBooks.syncReimbursedReports')}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.ZOHO_BOOKS.SYNC_REIMBURSED_REPORTS_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={syncReimbursedReports}
                onToggle={() => policyID && updateZohoBooksSyncReimbursedReports(policyID, !syncReimbursedReports, syncReimbursedReports)}
                pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.SYNC_REIMBURSED_REPORTS], zohoBooksConfig?.pendingFields)}
                errors={getLatestErrorField(zohoBooksConfig ?? {}, CONST.ZOHO_BOOKS_CONFIG.SYNC_REIMBURSED_REPORTS)}
                onCloseError={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.SYNC_REIMBURSED_REPORTS)}
            />
            <Accordion
                isExpanded={isSyncReimbursedReportsAccordionExpanded}
                isToggleTriggered={shouldAnimateSyncReimbursedReportsAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.BILL_PAYMENT_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}>
                    <MenuItemField
                        name={translate('workspace.zohoBooks.billPaymentAccount.label')}
                        onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_BILL_PAYMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                        value={billPaymentAccount?.name}
                    >
                        {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.BILL_PAYMENT_ACCOUNT_ID], zohoBooksConfig?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                    </MenuItemField>
                </OfflineWithFeedback>
            </Accordion>
            {isExpensifyCardsEnabled && (
                <>
                    <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
                    <ToggleSettingOptionRow
                        title={translate('workspace.zohoBooks.syncExpensifyCardSettlements')}
                        switchAccessibilityLabel={translate('workspace.zohoBooks.syncExpensifyCardSettlements')}
                        switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.ZOHO_BOOKS.SYNC_EXPENSIFY_CARD_SETTLEMENTS_SWITCH}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncExpensifyCardSettlements}
                        onToggle={() => policyID && updateZohoBooksSyncExpensifyCardSettlements(policyID, !syncExpensifyCardSettlements, syncExpensifyCardSettlements)}
                        pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS], zohoBooksConfig?.pendingFields)}
                        errors={getLatestErrorField(zohoBooksConfig ?? {}, CONST.ZOHO_BOOKS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                        onCloseError={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncExpensifyCardSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncExpensifyCardSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}>
                            <MenuItemField
                                name={translate('workspace.zohoBooks.settlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXPENSIFY_CARD_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={settlementsBankAccount?.name}
                            >
                                {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], zohoBooksConfig?.errorFields) && (
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
                        title={translate('workspace.zohoBooks.syncTravelBillingSettlements')}
                        switchAccessibilityLabel={translate('workspace.zohoBooks.syncTravelBillingSettlements')}
                        switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.ZOHO_BOOKS.SYNC_TRAVEL_BILLING_SETTLEMENTS_SWITCH}
                        shouldPlaceSubtitleBelowSwitch
                        wrapperStyle={[styles.mv3, styles.mh5]}
                        isActive={syncTravelInvoicingSettlements}
                        onToggle={() => policyID && updateZohoBooksSyncTravelBillingSettlements(policyID, !syncTravelInvoicingSettlements, syncTravelInvoicingSettlements)}
                        pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS], zohoBooksConfig?.pendingFields)}
                        errors={getLatestErrorField(zohoBooksConfig ?? {}, CONST.ZOHO_BOOKS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                        onCloseError={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS)}
                    />
                    <Accordion
                        isExpanded={isSyncTravelInvoicingSettlementsAccordionExpanded}
                        isToggleTriggered={shouldAnimateSyncTravelInvoicingSettlementsAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}>
                            <MenuItemField
                                name={translate('workspace.zohoBooks.travelBillingSettlementAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_TRAVEL_BILLING_SETTLEMENT_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={travelInvoicingSettlementsBankAccount?.name}
                            >
                                {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], zohoBooksConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                            </MenuItemField>
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}>
                            <MenuItemField
                                name={translate('workspace.zohoBooks.travelBillingPayableAccount.label')}
                                onPress={() => (policyID ? Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_TRAVEL_BILLING_PAYABLE_ACCOUNT.getRoute(policyID)) : undefined)}
                                value={travelInvoicingPayableAccount?.name}
                            >
                                {areSettingsInErrorFields([CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID], zohoBooksConfig?.errorFields) && (
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

export default withPolicyConnections(ZohoBooksAdvancedPage);
