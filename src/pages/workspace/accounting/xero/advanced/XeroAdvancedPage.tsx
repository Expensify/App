import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '';
    const xeroConfig = policy?.connections?.xero?.config;
    const {autoSync, pendingFields, sync} = xeroConfig ?? {};
    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const {invoiceCollectionsAccountID} = sync ?? {};

    const selectedBankAccountName = useMemo(() => {
        const selectedAccount = (bankAccounts ?? []).find((bank) => bank.id === invoiceCollectionsAccountID);

        return selectedAccount?.name ?? '';
    }, [bankAccounts, invoiceCollectionsAccountID]);

    return (
        <ConnectionLayout
            displayName={XeroAdvancedPage.displayName}
            headerTitle="workspace.xero.advancedConfig.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
        >
            <ToggleSettingOptionRow
                key={translate('workspace.xero.advancedConfig.autoSync')}
                title={translate('workspace.xero.advancedConfig.autoSync')}
                subtitle={translate('workspace.xero.advancedConfig.autoSyncDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={styles.mv3}
                isActive={Boolean(autoSync?.enabled)}
                onToggle={() =>
                    Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.AUTO_SYNC, {
                        enabled: !autoSync?.enabled,
                    })
                }
                pendingAction={pendingFields?.autoSync}
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.AUTO_SYNC)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.AUTO_SYNC)}
            />
            <OfflineWithFeedback pendingAction={pendingFields?.export}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={xeroConfig?.export?.billStatus?.purchase}
                    description={translate('workspace.xero.advancedConfig.purchaseBillStatusTitle')}
                    key={translate('workspace.xero.advancedConfig.purchaseBillStatusTitle')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    onPress={() => {}}
                />
            </OfflineWithFeedback>
            <ToggleSettingOptionRow
                key={translate('workspace.xero.advancedConfig.reimbursedReports')}
                title={translate('workspace.xero.advancedConfig.reimbursedReports')}
                subtitle={translate('workspace.xero.advancedConfig.reimbursedReportsDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={styles.mv3}
                isActive={Boolean(sync?.syncReimbursedReports)}
                onToggle={() =>
                    Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.SYNC, {
                        syncReimbursedReports: !sync?.syncReimbursedReports,
                    })
                }
                pendingAction={pendingFields?.sync}
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.SYNC)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.SYNC)}
            />
            {sync?.syncReimbursedReports && (
                <>
                    <OfflineWithFeedback pendingAction={pendingFields?.sync}>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={String(bankAccounts)}
                            description={translate('workspace.xero.advancedConfig.xeroBillPaymentAccount')}
                            key={translate('workspace.xero.advancedConfig.xeroBillPaymentAccount')}
                            wrapperStyle={[styles.sectionMenuItemTopDescription]}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR.getRoute(policyID))}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={pendingFields?.sync}>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={String(selectedBankAccountName)}
                            description={translate('workspace.xero.advancedConfig.xeroInvoiceCollectionAccount')}
                            key={translate('workspace.xero.advancedConfig.xeroInvoiceCollectionAccount')}
                            wrapperStyle={[styles.sectionMenuItemTopDescription]}
                            onPress={() => {
                                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR.getRoute(policyID));
                            }}
                        />
                    </OfflineWithFeedback>
                </>
            )}
        </ConnectionLayout>
    );
}

XeroAdvancedPage.displayName = 'XeroAdvancedPage';

export default withPolicyConnections(XeroAdvancedPage);
