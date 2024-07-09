import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {DividerLineItem, MenuItem, ToggleItem} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';

    const config = policy?.connections?.netsuite?.options.config;
    const autoSyncConfig = policy?.connections?.netsuite?.config;

    const {payableList} = policy?.connections?.netsuite?.options?.data ?? {};

    const selectedReimbursementAccount = useMemo(
        () => (payableList ?? []).find((payableAccount) => payableAccount.id === config?.reimbursementAccountID),
        [payableList, config?.reimbursementAccountID],
    );
    const selectedCollectionAccount = useMemo(() => (payableList ?? []).find((payableAccount) => payableAccount.id === config?.collectionAccount), [payableList, config?.collectionAccount]);
    const selectedApprovalAccount = useMemo(() => {
        if (config?.approvalAccount === CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT) {
            return {
                id: CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
                name: translate('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
            };
        }
        return (payableList ?? []).find((payableAccount) => payableAccount.id === config?.approvalAccount);
    }, [config?.approvalAccount, payableList, translate]);

    const menuItems: Array<MenuItem | ToggleItem | DividerLineItem> = [
        {
            type: 'toggle',
            title: translate('workspace.accounting.autoSync'),
            subtitle: translate('workspace.netsuite.advancedConfig.autoSyncDescription'),
            isActive: !!autoSyncConfig?.autoSync.enabled,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.autoSyncDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            onCloseError: () => Policy.clearNetSuiteAutoSyncErrorField(policyID),
            onToggle: (isEnabled) => Connections.updateNetSuiteAutoSync(policyID, isEnabled),
            pendingAction: autoSyncConfig?.pendingFields?.autoSync,
            errors: ErrorUtils.getLatestErrorField(autoSyncConfig, CONST.NETSUITE_CONFIG.AUTO_SYNC),
        },
        {
            type: 'divider',
            key: 'divider1',
        },
        {
            type: 'toggle',
            title: translate('workspace.accounting.reimbursedReports'),
            subtitle: translate('workspace.netsuite.advancedConfig.reimbursedReportsDescription'),
            isActive: !!config?.syncOptions.syncReimbursedReports,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.reimbursedReportsDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS),
            onToggle: (isEnabled) => Connections.updateNetSuiteSyncReimbursedReports(policyID, isEnabled),
            pendingAction: config?.syncOptions.pendingFields?.syncReimbursedReports,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS),
            shouldHide: config?.reimbursableExpensesExportDestination === CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.reimbursementsAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.reimbursementAccountID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedReimbursementAccount ? selectedReimbursementAccount.name : undefined,
            pendingAction: config?.pendingFields?.reimbursementAccountID,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
            shouldHide: config?.reimbursableExpensesExportDestination === CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.collectionsAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.collectionAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedCollectionAccount ? selectedCollectionAccount.name : undefined,
            pendingAction: config?.pendingFields?.collectionAccount,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT),
            shouldHide: config?.reimbursableExpensesExportDestination === CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            type: 'divider',
            key: 'divider2',
            shouldHide: config?.reimbursableExpensesExportDestination === CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.netsuite.advancedConfig.inviteEmployeesDescription'),
            isActive: !!config?.syncOptions.syncPeople,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.inviteEmployeesDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            shouldParseSubtitle: true,
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE),
            onToggle: (isEnabled) => Connections.updateNetSuiteSyncPeople(policyID, isEnabled),
            pendingAction: config?.syncOptions.pendingFields?.syncPeople,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.autoCreateEntities'),
            isActive: !!config?.autoCreateEntities,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.autoCreateEntities'),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES),
            onToggle: (isEnabled) => Connections.updateNetSuiteAutoCreateEntities(policyID, isEnabled),
            pendingAction: config?.pendingFields?.autoCreateEntities,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES),
        },
        {
            type: 'divider',
            key: 'divider3',
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.enableCategories'),
            isActive: !!config?.syncOptions.enableNewCategories,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.enableCategories'),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES),
            onToggle: (isEnabled) => Connections.updateNetSuiteEnableNewCategories(policyID, isEnabled),
            pendingAction: config?.syncOptions.pendingFields?.enableNewCategories,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES),
        },
        {
            type: 'divider',
            key: 'divider4',
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportReportsTo.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.exportReportsTo ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.syncOptions.exportReportsTo ? translate(`workspace.netsuite.advancedConfig.exportReportsTo.values.${config.syncOptions.exportReportsTo}`) : undefined,
            pendingAction: config?.syncOptions.pendingFields?.exportReportsTo,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO),
            shouldHide: config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT,
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportVendorBillsTo.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.exportVendorBillsTo ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.syncOptions.exportVendorBillsTo ? translate(`workspace.netsuite.advancedConfig.exportVendorBillsTo.values.${config.syncOptions.exportVendorBillsTo}`) : undefined,
            pendingAction: config?.syncOptions.pendingFields?.exportVendorBillsTo,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO),
            shouldHide:
                config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL &&
                config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL,
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportJournalsTo.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.exportJournalsTo ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.syncOptions.exportJournalsTo ? translate(`workspace.netsuite.advancedConfig.exportJournalsTo.values.${config.syncOptions.exportJournalsTo}`) : undefined,
            pendingAction: config?.syncOptions.pendingFields?.exportJournalsTo,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO),
            shouldHide:
                config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY &&
                config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.approvalAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT.getRoute(policyID)),
            brickRoadIndicator: config?.errorFields?.approvalAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedApprovalAccount ? selectedApprovalAccount.name : undefined,
            pendingAction: config?.pendingFields?.approvalAccount,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT),
        },
        {
            type: 'divider',
            key: 'divider5',
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.customFormID'),
            subtitle: translate('workspace.netsuite.advancedConfig.customFormIDDescription'),
            isActive: !!config?.customFormIDOptions?.enabled,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.customFormIDDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS),
            onToggle: (isEnabled) => Connections.updateNetSuiteCustomFormIDOptionsEnabled(policyID, isEnabled),
            pendingAction: config?.pendingFields?.customFormIDOptions,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.customFormIDReimbursable'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE)),
            brickRoadIndicator: config?.errorFields?.customFormIDOptions ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.customFormIDOptions?.reimbursable[CONST.NETSUITE_MAP_EXPORT_DESTINATION[config.reimbursableExpensesExportDestination]],
            pendingAction: config?.pendingFields?.customFormIDOptions,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS),
            shouldHide: !config?.customFormIDOptions?.enabled,
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.customFormIDNonReimbursable'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.NON_REIMBURSABLE)),
            brickRoadIndicator: config?.errorFields?.customFormIDOptions ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.customFormIDOptions?.nonReimbursable[CONST.NETSUITE_MAP_EXPORT_DESTINATION[config.nonreimbursableExpensesExportDestination]],
            pendingAction: config?.pendingFields?.customFormIDOptions,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS),
            shouldHide: !config?.customFormIDOptions?.enabled,
        },
    ];

    return (
        <ConnectionLayout
            displayName={NetSuiteAdvancedPage.displayName}
            headerTitle="workspace.accounting.advanced"
            headerSubtitle={config?.subsidiary ?? ''}
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

NetSuiteAdvancedPage.displayName = 'NetSuiteAdvancedPage';

export default withPolicyConnections(NetSuiteAdvancedPage);
