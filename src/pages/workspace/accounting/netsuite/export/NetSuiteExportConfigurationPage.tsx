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
import {
    areSettingsInErrorFields,
    findSelectedBankAccountWithDefaultSelect,
    findSelectedInvoiceItemWithDefaultSelect,
    findSelectedTaxAccountWithDefaultSelect,
    settingsPendingAction,
} from '@libs/PolicyUtils';
import type {DividerLineItem, MenuItem, ToggleItem} from '@pages/workspace/accounting/netsuite/types';
import {
    shouldHideExportForeignCurrencyAmount,
    shouldHideJournalPostingPreference,
    shouldHideNonReimbursableJournalPostingAccount,
    shouldHideProvincialTaxPostingAccountSelect,
    shouldHideReimbursableDefaultVendor,
    shouldHideReimbursableJournalPostingAccount,
    shouldHideTaxPostingAccountSelect,
    shouldShowInvoiceItemMenuItem,
} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuItemWithSubscribedSettings = Pick<MenuItem, 'type' | 'description' | 'title' | 'onPress' | 'shouldHide'> & {subscribedSettings?: string[]};

function NetSuiteExportConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const policyOwner = policy?.owner ?? '';
    const {canUseNetSuiteUSATax} = usePermissions();

    const config = policy?.connections?.netsuite?.options.config;

    const {subsidiaryList, receivableList, taxAccountsList, items} = policy?.connections?.netsuite?.options?.data ?? {};
    const selectedSubsidiary = useMemo(() => (subsidiaryList ?? []).find((subsidiary) => subsidiary.internalID === config?.subsidiaryID), [subsidiaryList, config?.subsidiaryID]);

    const selectedReceivable = useMemo(() => findSelectedBankAccountWithDefaultSelect(receivableList, config?.receivableAccount), [receivableList, config?.receivableAccount]);

    const selectedItem = useMemo(() => findSelectedInvoiceItemWithDefaultSelect(items, config?.invoiceItem), [items, config?.invoiceItem]);

    const invoiceItemValue = useMemo(() => {
        if (!config?.invoiceItemPreference) {
            return translate('workspace.netsuite.invoiceItem.values.create.label');
        }
        if (config.invoiceItemPreference === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE) {
            return translate('workspace.netsuite.invoiceItem.values.create.label');
        }
        if (!selectedItem) {
            return translate('workspace.netsuite.invoiceItem.values.select.label');
        }
        return selectedItem.name;
    }, [config?.invoiceItemPreference, selectedItem, translate]);

    const selectedTaxPostingAccount = useMemo(() => findSelectedTaxAccountWithDefaultSelect(taxAccountsList, config?.taxPostingAccount), [taxAccountsList, config?.taxPostingAccount]);

    const selectedProvTaxPostingAccount = useMemo(
        () => findSelectedTaxAccountWithDefaultSelect(taxAccountsList, config?.provincialTaxPostingAccount),
        [taxAccountsList, config?.provincialTaxPostingAccount],
    );

    const menuItems: Array<MenuItemWithSubscribedSettings | ToggleItem | DividerLineItem> = [
        {
            type: 'menuitem',
            title: config?.exporter ?? policyOwner,
            description: translate('workspace.accounting.preferredExporter'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT.getRoute(policyID));
            },
            subscribedSettings: [CONST.NETSUITE_CONFIG.EXPORTER],
        },
        {
            type: 'divider',
            key: 'divider1',
        },
        {
            type: 'menuitem',
            title: config?.exportDate
                ? translate(`workspace.netsuite.exportDate.values.${config.exportDate}.label`)
                : translate(`workspace.netsuite.exportDate.values.${CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE}.label`),
            description: translate('workspace.accounting.exportDate'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_DATE_SELECT.getRoute(policyID)),
            subscribedSettings: [CONST.NETSUITE_CONFIG.EXPORT_DATE],
        },
        {
            type: 'menuitem',
            title: config?.reimbursableExpensesExportDestination ? translate(`workspace.netsuite.exportDestination.values.${config.reimbursableExpensesExportDestination}.label`) : undefined,
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE)),
            subscribedSettings: [
                CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                ...(!shouldHideReimbursableDefaultVendor(true, config) ? [CONST.NETSUITE_CONFIG.DEFAULT_VENDOR] : []),
                ...(!shouldHideNonReimbursableJournalPostingAccount(true, config) ? [CONST.NETSUITE_CONFIG.PAYABLE_ACCT] : []),
                ...(!shouldHideReimbursableJournalPostingAccount(true, config) ? [CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []),
                ...(!shouldHideJournalPostingPreference(true, config) ? [CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []),
            ],
        },
        {
            type: 'menuitem',
            title: config?.nonreimbursableExpensesExportDestination
                ? translate(`workspace.netsuite.exportDestination.values.${config.nonreimbursableExpensesExportDestination}.label`)
                : undefined,
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.NON_REIMBURSABLE)),
            subscribedSettings: [
                CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                ...(!shouldHideReimbursableDefaultVendor(false, config) ? [CONST.NETSUITE_CONFIG.DEFAULT_VENDOR] : []),
                ...(!shouldHideNonReimbursableJournalPostingAccount(false, config) ? [CONST.NETSUITE_CONFIG.PAYABLE_ACCT] : []),
                ...(!shouldHideReimbursableJournalPostingAccount(false, config) ? [CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []),
                ...(!shouldHideJournalPostingPreference(false, config) ? [CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []),
            ],
        },
        {
            type: 'divider',
            key: 'divider2',
        },
        {
            type: 'menuitem',
            title: selectedReceivable ? selectedReceivable.name : undefined,
            description: translate('workspace.netsuite.exportInvoices'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT.getRoute(policyID)),
            subscribedSettings: [CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT],
        },
        {
            type: 'menuitem',
            title: invoiceItemValue,
            description: translate('workspace.netsuite.invoiceItem.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.getRoute(policyID)),
            subscribedSettings: [CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE, ...(shouldShowInvoiceItemMenuItem(config) ? [CONST.NETSUITE_CONFIG.INVOICE_ITEM] : [])],
        },
        {
            type: 'divider',
            key: 'divider3',
        },
        {
            type: 'menuitem',
            title: selectedProvTaxPostingAccount ? selectedProvTaxPostingAccount.name : undefined,
            description: translate('workspace.netsuite.journalEntriesProvTaxPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT.getRoute(policyID)),
            subscribedSettings: [CONST.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT],
            shouldHide: shouldHideProvincialTaxPostingAccountSelect(selectedSubsidiary, config),
        },
        {
            type: 'menuitem',
            title: selectedTaxPostingAccount ? selectedTaxPostingAccount.name : undefined,
            description: translate('workspace.netsuite.journalEntriesTaxPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT.getRoute(policyID)),
            subscribedSettings: [CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT],
            shouldHide: shouldHideTaxPostingAccountSelect(canUseNetSuiteUSATax, selectedSubsidiary, config),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.foreignCurrencyAmount'),
            isActive: !!config?.allowForeignCurrency,
            switchAccessibilityLabel: translate('workspace.netsuite.foreignCurrencyAmount'),
            onToggle: () => Connections.updateNetSuiteAllowForeignCurrency(policyID, !config?.allowForeignCurrency, config?.allowForeignCurrency),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY),
            pendingAction: settingsPendingAction([CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY], config?.pendingFields),
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY),
            shouldHide: shouldHideExportForeignCurrencyAmount(config),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.exportToNextOpenPeriod'),
            isActive: !!config?.exportToNextOpenPeriod,
            switchAccessibilityLabel: translate('workspace.netsuite.exportToNextOpenPeriod'),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD),
            onToggle: () => Connections.updateNetSuiteExportToNextOpenPeriod(policyID, !config?.exportToNextOpenPeriod, config?.exportToNextOpenPeriod ?? false),
            pendingAction: settingsPendingAction([CONST.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD], config?.pendingFields),
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
                                    pendingAction={settingsPendingAction(item.subscribedSettings, config?.pendingFields)}
                                >
                                    <MenuItemWithTopDescription
                                        title={item.title}
                                        description={item.description}
                                        shouldShowRightIcon
                                        onPress={item?.onPress}
                                        brickRoadIndicator={areSettingsInErrorFields(item.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
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
