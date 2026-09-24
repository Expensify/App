import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, getCurrentXeroOrganizationName, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {updateXeroSyncSyncReimbursedReports} from '@userActions/connections/Xero';
import {clearXeroErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useMemo} from 'react';

function XeroAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);

    const policyID = policy?.id;
    const xeroConfig = policy?.connections?.xero?.config;
    const {pendingFields, errorFields, sync} = xeroConfig ?? {};
    const {bankAccounts, expenseAccounts} = policy?.connections?.xero?.data ?? {};
    const {invoiceCollectionsAccountID, reimbursementAccountID} = sync ?? {};
    const accountingMethod = xeroConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;

    const getSelectedAccountName = useMemo(
        () => (accountID: string | undefined) => {
            if (!accountID) {
                return;
            }

            const selectedAccount = (bankAccounts ?? []).find((bank) => bank.id === accountID);
            return selectedAccount?.name;
        },
        [bankAccounts],
    );

    const selectedBankAccountName = getSelectedAccountName(invoiceCollectionsAccountID);
    const selectedBillPaymentAccountName = getSelectedAccountName(reimbursementAccountID);
    const selectedFxExpenseAccountName = (expenseAccounts ?? []).find((account) => account.id === xeroConfig?.fxExpenseAccount)?.name;

    const currentXeroOrganizationName = useMemo(() => getCurrentXeroOrganizationName(policy ?? undefined), [policy]);

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(!!sync?.syncReimbursedReports);

    return (
        <ConnectionLayout
            displayName="XeroAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            headerSubtitle={currentXeroOrganizationName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.XERO_CONFIG.AUTO_SYNC, CONST.XERO_CONFIG.ACCOUNTING_METHOD], xeroConfig?.pendingFields)}>
                <MenuItemSectionRow onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_AUTO_SYNC.path))}>
                    <MenuItemField.Row
                        name={translate('workspace.accounting.autoSync')}
                        value={xeroConfig?.autoSync?.enabled ? translate('common.enabled') : translate('common.disabled')}
                    >
                        {areSettingsInErrorFields([CONST.XERO_CONFIG.AUTO_SYNC, CONST.XERO_CONFIG.ACCOUNTING_METHOD], xeroConfig?.errorFields) && (
                            <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                        )}
                        <MenuItem.Chevron />
                    </MenuItemField.Row>
                    {!!xeroConfig?.autoSync?.enabled && <MenuItem.HelpText message={translate(`workspace.xero.accountingMethods.alternateText.${accountingMethod}` as TranslationPaths)} />}
                </MenuItemSectionRow>
            </OfflineWithFeedback>
            <ToggleSettingOptionRow
                key={translate('workspace.accounting.reimbursedReports')}
                title={translate('workspace.accounting.reimbursedReports')}
                subtitle={translate('workspace.xero.advancedConfig.reimbursedReportsDescription')}
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.reimbursedReportsDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={styles.mv3}
                isActive={!!sync?.syncReimbursedReports}
                onToggle={() => updateXeroSyncSyncReimbursedReports(policyID, !sync?.syncReimbursedReports, sync?.syncReimbursedReports)}
                pendingAction={settingsPendingAction([CONST.XERO_CONFIG.SYNC_REIMBURSED_REPORTS], pendingFields)}
                errors={getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.SYNC_REIMBURSED_REPORTS)}
                onCloseError={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.SYNC_REIMBURSED_REPORTS)}
            />
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                <>
                    <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID], pendingFields)}>
                        <MenuItemSectionRow onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR.getRoute(policyID))}>
                            <MenuItemField.Row
                                name={translate('workspace.xero.advancedConfig.xeroBillPaymentAccount')}
                                value={selectedBillPaymentAccountName ? String(selectedBillPaymentAccountName) : undefined}
                            >
                                {areSettingsInErrorFields([CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID], errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                                <MenuItem.Chevron />
                            </MenuItemField.Row>
                        </MenuItemSectionRow>
                    </OfflineWithFeedback>
                    {canConfigureCurrencyConversionFees && (
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT], pendingFields)}>
                            <MenuItemSectionRow onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_FX_EXPENSE_ACCOUNT_SELECTOR.getRoute(policyID))}>
                                <MenuItemField.Row
                                    name={translate('workspace.xero.advancedConfig.xeroFxExpenseAccount')}
                                    value={selectedFxExpenseAccountName}
                                >
                                    {areSettingsInErrorFields([CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT], errorFields) && (
                                        <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                    )}
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                            </MenuItemSectionRow>
                        </OfflineWithFeedback>
                    )}
                    <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID], pendingFields)}>
                        <MenuItemSectionRow onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR.getRoute(policyID))}>
                            <MenuItemField.Row
                                name={translate('workspace.xero.advancedConfig.xeroInvoiceCollectionAccount')}
                                value={selectedBankAccountName ? String(selectedBankAccountName) : undefined}
                            >
                                {areSettingsInErrorFields([CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID], errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                                <MenuItem.Chevron />
                            </MenuItemField.Row>
                        </MenuItemSectionRow>
                    </OfflineWithFeedback>
                </>
            </Accordion>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(XeroAdvancedPage);
