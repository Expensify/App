import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canUseProvincialTaxNetSuite, canUseTaxNetSuite} from '@libs/PolicyUtils';
import type {DividerLineItem, MenuItem, ToggleItem} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteExportConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const policyOwner = policy?.owner ?? '';
    const {canUseNetSuiteUSATax} = usePermissions();

    const config = policy?.connections?.netsuite?.options.config;

    const {subsidiaryList, receivableList, taxAccountsList, items} = policy?.connections?.netsuite?.options?.data ?? {};
    const selectedSubsidiary = useMemo(() => (subsidiaryList ?? []).find((subsidiary) => subsidiary.internalID === config?.subsidiaryID), [subsidiaryList, config?.subsidiaryID]);

    const selectedReceivable = useMemo(() => (receivableList ?? []).find((receivable) => receivable.id === config?.receivableAccount), [receivableList, config?.receivableAccount]);

    const selectedItem = useMemo(() => (items ?? []).find((item) => item.id === config?.invoiceItem), [items, config?.invoiceItem]);

    const invoiceItemValue = useMemo(() => {
        if (!config?.invoiceItemPreference) {
            return undefined;
        }
        if (config.invoiceItemPreference === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE) {
            return translate('workspace.netsuite.invoiceItem.values.create.label');
        }
        if (!selectedItem) {
            return translate('workspace.netsuite.invoiceItem.values.select.label');
        }
        return selectedItem.name;
    }, [config?.invoiceItemPreference, selectedItem, translate]);

    const selectedTaxPostingAccount = useMemo(
        () => (taxAccountsList ?? []).find((taxAccount) => taxAccount.externalID === config?.taxPostingAccount),
        [taxAccountsList, config?.taxPostingAccount],
    );

    const selectedProvTaxPostingAccount = useMemo(
        () => (taxAccountsList ?? []).find((taxAccount) => taxAccount.externalID === config?.provincialTaxPostingAccount),
        [taxAccountsList, config?.provincialTaxPostingAccount],
    );

    const menuItems: Array<MenuItem | ToggleItem | DividerLineItem> = [
        {
            type: 'menuitem',
            description: translate('workspace.accounting.preferredExporter'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT.getRoute(policyID));
            },
            brickRoadIndicator: config?.errorFields?.exporter ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.exporter ?? policyOwner,
            pendingAction: config?.pendingFields?.exporter,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.EXPORTER),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.EXPORTER),
        },
        {
            type: 'divider',
            key: 'divider1',
        },
        {
            type: 'menuitem',
            description: translate('common.date'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_DATE_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.exportDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.exportDate ? translate(`workspace.netsuite.exportDate.values.${config.exportDate}.label`) : undefined,
            pendingAction: config?.pendingFields?.exportDate,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.EXPORT_DATE),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.EXPORT_DATE),
        },
        {
            type: 'menuitem',
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE)),
            brickRoadIndicator: config?.errorFields?.reimbursableExpensesExportDestination ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.reimbursableExpensesExportDestination ? translate(`workspace.netsuite.exportDestination.values.${config.reimbursableExpensesExportDestination}.label`) : undefined,
            pendingAction: config?.pendingFields?.reimbursableExpensesExportDestination,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION),
        },
        {
            type: 'menuitem',
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.NON_REIMBURSABLE)),
            brickRoadIndicator: config?.errorFields?.nonreimbursableExpensesExportDestination ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.nonreimbursableExpensesExportDestination
                ? translate(`workspace.netsuite.exportDestination.values.${config.nonreimbursableExpensesExportDestination}.label`)
                : undefined,
            pendingAction: config?.pendingFields?.nonreimbursableExpensesExportDestination,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION),
        },
        {
            type: 'divider',
            key: 'divider2',
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.exportInvoices'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.receivableAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedReceivable ? selectedReceivable.name : undefined,
            pendingAction: config?.pendingFields?.receivableAccount,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.invoiceItem.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.invoiceItemPreference ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: invoiceItemValue,
            pendingAction: config?.pendingFields?.invoiceItemPreference,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE),
        },
        {
            type: 'divider',
            key: 'divider3',
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.journalEntriesProvTaxPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.provincialTaxPostingAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedProvTaxPostingAccount ? selectedProvTaxPostingAccount.name : undefined,
            pendingAction: config?.pendingFields?.provincialTaxPostingAccount,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT),
            shouldHide: !!config?.suiteTaxEnabled || !config?.syncOptions.syncTax || !canUseProvincialTaxNetSuite(selectedSubsidiary?.country),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.journalEntriesTaxPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.taxPostingAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedTaxPostingAccount ? selectedTaxPostingAccount.name : undefined,
            pendingAction: config?.pendingFields?.taxPostingAccount,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT),
            shouldHide: !!config?.suiteTaxEnabled || !config?.syncOptions.syncTax || !canUseTaxNetSuite(canUseNetSuiteUSATax, selectedSubsidiary?.country),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.foreignCurrencyAmount'),
            isActive: !!config?.allowForeignCurrency,
            switchAccessibilityLabel: translate('workspace.netsuite.foreignCurrencyAmount'),
            onToggle: () => Connections.updateNetSuiteAllowForeignCurrency(policyID, !config?.allowForeignCurrency, config?.allowForeignCurrency),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY),
            pendingAction: config?.pendingFields?.allowForeignCurrency,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY),
            shouldHide:
                config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT &&
                config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT,
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.exportToNextOpenPeriod'),
            isActive: !!config?.exportToNextOpenPeriod,
            switchAccessibilityLabel: translate('workspace.netsuite.exportToNextOpenPeriod'),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD),
            onToggle: () => Connections.updateNetSuiteExportToNextOpenPeriod(policyID, !config?.exportToNextOpenPeriod, config?.exportToNextOpenPeriod ?? false),
            pendingAction: config?.pendingFields?.exportToNextOpenPeriod,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD),
        },
    ];

    return (
        <ConnectionLayout
            displayName={NetSuiteExportConfigurationPage.displayName}
            headerTitle="workspace.accounting.export"
            headerSubtitle={config?.subsidiary ?? ''}
            title="workspace.netsuite.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            {menuItems
                .filter((item) => !item.shouldHide)
                .map((item) => {
                    switch (item.type) {
                        case 'divider':
                            return (
                                <View
                                    key={item.key}
                                    style={styles.dividerLine}
                                />
                            );
                        case 'toggle':
                            // eslint-disable-next-line no-case-declarations
                            const {type, shouldHide, ...rest} = item;
                            return (
                                <ToggleSettingOptionRow
                                    key={rest.title}
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...rest}
                                    wrapperStyle={[styles.mv3, styles.ph5]}
                                />
                            );
                        default:
                            return (
                                <OfflineWithFeedback
                                    key={item.description}
                                    pendingAction={item.pendingAction}
                                    errors={item.errors}
                                    errorRowStyles={[styles.ph5]}
                                    onClose={item.onCloseError}
                                >
                                    <MenuItemWithTopDescription
                                        title={item.title}
                                        description={item.description}
                                        shouldShowRightIcon
                                        onPress={item?.onPress}
                                        brickRoadIndicator={item?.brickRoadIndicator}
                                        helperText={item?.helperText}
                                        errorText={item?.errorText}
                                    />
                                </OfflineWithFeedback>
                            );
                    }
                })}
        </ConnectionLayout>
    );
}

NetSuiteExportConfigurationPage.displayName = 'NetSuiteExportConfigurationPage';

export default withPolicyConnections(NetSuiteExportConfigurationPage);
