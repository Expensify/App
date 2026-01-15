import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    updateNetSuiteAutoCreateEntities,
    updateNetSuiteCustomFormIDOptionsEnabled,
    updateNetSuiteEnableNewCategories,
    updateNetSuiteSyncPeople,
    updateNetSuiteSyncReimbursedReports,
} from '@libs/actions/connections/NetSuiteCommands';
import {clearNetSuiteErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {
    areSettingsInErrorFields,
    findSelectedBankAccountWithDefaultSelect,
    getFilteredApprovalAccountOptions,
    getFilteredCollectionAccountOptions,
    getFilteredReimbursableAccountOptions,
    settingsPendingAction,
} from '@libs/PolicyUtils';
import type {ExtendedMenuItemWithSubscribedSettings, MenuItemToRender} from '@pages/workspace/accounting/netsuite/types';
import {
    shouldHideCustomFormIDOptions,
    shouldHideExportJournalsTo,
    shouldHideExportVendorBillsTo,
    shouldHideReimbursedReportsSection,
    shouldHideReportsExportTo,
} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

function NetSuiteAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? `${CONST.DEFAULT_NUMBER_ID}`;

    const config = policy?.connections?.netsuite?.options?.config;
    const autoSyncConfig = policy?.connections?.netsuite?.config;
    const accountingMethod = policy?.connections?.netsuite?.options?.config?.accountingMethod;
    const {payableList} = policy?.connections?.netsuite?.options?.data ?? {};

    const shouldShowCustomFormIDOptions = useSharedValue(!shouldHideCustomFormIDOptions(config));
    const shouldAnimateAccordionSection = useSharedValue(false);

    const selectedReimbursementAccount = useMemo(
        () => findSelectedBankAccountWithDefaultSelect(getFilteredReimbursableAccountOptions(payableList), config?.reimbursementAccountID),
        [payableList, config?.reimbursementAccountID],
    );
    const selectedCollectionAccount = useMemo(
        () => findSelectedBankAccountWithDefaultSelect(getFilteredCollectionAccountOptions(payableList), config?.collectionAccount),
        [payableList, config?.collectionAccount],
    );
    const selectedApprovalAccount = useMemo(() => {
        if (config?.approvalAccount === CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT) {
            return {
                id: CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
                name: translate('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
            };
        }
        return findSelectedBankAccountWithDefaultSelect(getFilteredApprovalAccountOptions(payableList), config?.approvalAccount);
    }, [config?.approvalAccount, payableList, translate]);

    const renderDefaultMenuItem = (item: MenuItemToRender) => {
        return (
            <OfflineWithFeedback
                key={item.description}
                pendingAction={settingsPendingAction(item.subscribedSettings, config?.pendingFields) ?? settingsPendingAction(item.subscribedSettings, autoSyncConfig?.pendingFields)}
            >
                <MenuItemWithTopDescription
                    title={item.title}
                    description={item.description}
                    shouldShowRightIcon
                    onPress={item?.onPress}
                    brickRoadIndicator={areSettingsInErrorFields(item.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    hintText={item.hintText}
                />
            </OfflineWithFeedback>
        );
    };

    const menuItems: ExtendedMenuItemWithSubscribedSettings[] = [
        {
            type: 'menuitem',
            title: autoSyncConfig?.autoSync?.enabled ? translate('common.enabled') : translate('common.disabled'),
            description: translate('workspace.accounting.autoSync'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC.getRoute(policyID)),
            hintText: (() => {
                if (!autoSyncConfig?.autoSync?.enabled) {
                    return undefined;
                }
                return translate(
                    `workspace.netsuite.advancedConfig.accountingMethods.alternateText.${accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH}` as TranslationPaths,
                );
            })(),
            subscribedSettings: [CONST.NETSUITE_CONFIG.AUTO_SYNC, CONST.NETSUITE_CONFIG.ACCOUNTING_METHOD],
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
            onCloseError: () => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS),
            onToggle: (isEnabled) => updateNetSuiteSyncReimbursedReports(policyID, isEnabled),
            pendingAction: settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS], config?.pendingFields),
            errors: getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS),
            shouldHide: shouldHideReimbursedReportsSection(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.reimbursementsAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT.getRoute(policyID)),
            title: selectedReimbursementAccount ? selectedReimbursementAccount.name : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID],
            shouldHide: shouldHideReimbursedReportsSection(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.collectionsAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT.getRoute(policyID)),
            title: selectedCollectionAccount ? selectedCollectionAccount.name : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT],
            shouldHide: shouldHideReimbursedReportsSection(config),
        },
        {
            type: 'divider',
            key: 'divider2',
            shouldHide: shouldHideReimbursedReportsSection(config),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.netsuite.advancedConfig.inviteEmployeesDescription'),
            isActive: !!config?.syncOptions.syncPeople,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.inviteEmployeesDescription'),
            shouldPlaceSubtitleBelowSwitch: true,
            shouldParseSubtitle: true,
            onCloseError: () => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE),
            onToggle: (isEnabled) => updateNetSuiteSyncPeople(policyID, isEnabled),
            pendingAction: settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE], config?.pendingFields),
            errors: getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.advancedConfig.autoCreateEntities'),
            isActive: !!config?.autoCreateEntities,
            switchAccessibilityLabel: translate('workspace.netsuite.advancedConfig.autoCreateEntities'),
            onCloseError: () => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES),
            onToggle: (isEnabled) => updateNetSuiteAutoCreateEntities(policyID, isEnabled),
            pendingAction: settingsPendingAction([CONST.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES], config?.pendingFields),
            errors: getLatestErrorField(config, CONST.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES),
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
            onCloseError: () => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES),
            onToggle: (isEnabled) => updateNetSuiteEnableNewCategories(policyID, isEnabled),
            pendingAction: settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES], config?.pendingFields),
            errors: getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES),
        },
        {
            type: 'divider',
            key: 'divider4',
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportReportsTo.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT.getRoute(policyID)),
            title: config?.syncOptions.exportReportsTo ? translate(`workspace.netsuite.advancedConfig.exportReportsTo.values.${config.syncOptions.exportReportsTo}`) : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO],
            shouldHide: shouldHideReportsExportTo(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportVendorBillsTo.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT.getRoute(policyID)),
            title: config?.syncOptions.exportVendorBillsTo ? translate(`workspace.netsuite.advancedConfig.exportVendorBillsTo.values.${config.syncOptions.exportVendorBillsTo}`) : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO],
            shouldHide: shouldHideExportVendorBillsTo(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.exportJournalsTo.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT.getRoute(policyID)),
            title: config?.syncOptions.exportJournalsTo ? translate(`workspace.netsuite.advancedConfig.exportJournalsTo.values.${config.syncOptions.exportJournalsTo}`) : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO],
            shouldHide: shouldHideExportJournalsTo(config),
        },
        {
            type: 'menuitem',
            description: translate('workspace.netsuite.advancedConfig.approvalAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT.getRoute(policyID)),
            title: selectedApprovalAccount ? selectedApprovalAccount.name : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT],
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
            onCloseError: () => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED),
            onToggle: (isEnabled) => {
                updateNetSuiteCustomFormIDOptionsEnabled(policyID, isEnabled);
                shouldShowCustomFormIDOptions.set(isEnabled);
                shouldAnimateAccordionSection.set(true);
            },
            pendingAction: settingsPendingAction([CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED], config?.pendingFields),
            errors: getLatestErrorField(config, CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED),
        },
        {
            type: 'accordion',
            children: [
                {
                    type: 'menuitem',
                    description: translate('workspace.netsuite.advancedConfig.customFormIDReimbursable'),
                    onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE)),
                    title: config?.customFormIDOptions?.reimbursable?.[CONST.NETSUITE_MAP_EXPORT_DESTINATION[config.reimbursableExpensesExportDestination]],
                    subscribedSettings: [CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.REIMBURSABLE],
                    shouldHide: shouldHideCustomFormIDOptions(config),
                },
                {
                    type: 'menuitem',
                    description: translate('workspace.netsuite.advancedConfig.customFormIDNonReimbursable'),
                    onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID.getRoute(policyID, CONST.NETSUITE_EXPENSE_TYPE.NON_REIMBURSABLE)),
                    title: config?.customFormIDOptions?.nonReimbursable?.[CONST.NETSUITE_MAP_EXPORT_DESTINATION[config.nonreimbursableExpensesExportDestination]],
                    subscribedSettings: [CONST.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.NON_REIMBURSABLE],
                    shouldHide: shouldHideCustomFormIDOptions(config),
                },
            ],
            shouldHide: false,
            shouldExpand: shouldShowCustomFormIDOptions,
            shouldAnimateSection: shouldAnimateAccordionSection,
        },
    ];

    return (
        <ConnectionLayout
            displayName="NetSuiteAdvancedPage"
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
                .filter((item) => !item?.shouldHide)
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
                        case 'accordion':
                            return (
                                <Accordion
                                    isExpanded={item.shouldExpand}
                                    isToggleTriggered={item.shouldAnimateSection}
                                >
                                    {item.children.map((child) => {
                                        return renderDefaultMenuItem(child);
                                    })}
                                </Accordion>
                            );
                        default:
                            return renderDefaultMenuItem(item);
                    }
                })}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(NetSuiteAdvancedPage);

export {shouldHideReimbursedReportsSection};
