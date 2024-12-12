import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {MenuItem, ToggleItem} from '@pages/workspace/accounting/intacct/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {updateSageIntacctDefaultVendor} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {getDefaultVendorName} from './utils';

type MenuItemWithSubscribedSettings = Pick<MenuItem, 'type' | 'description' | 'title' | 'onPress' | 'shouldHide'> & {subscribedSettings?: string[]};

type ToggleItemWithKey = ToggleItem & {key: string};

function SageIntacctReimbursableExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};
    const {reimbursable, reimbursableExpenseReportDefaultVendor} = policy?.connections?.intacct?.config?.export ?? {};

    const defaultVendorName = getDefaultVendorName(reimbursableExpenseReportDefaultVendor, intacctData?.vendors);

    const menuItems: Array<MenuItemWithSubscribedSettings | ToggleItemWithKey> = [
        {
            type: 'menuitem',
            title: reimbursable ? translate(`workspace.sageIntacct.reimbursableExpenses.values.${reimbursable}`) : translate('workspace.sageIntacct.notConfigured'),
            description: translate('workspace.accounting.exportAs'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION.getRoute(policyID));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE],
        },
        {
            type: 'toggle',
            title: translate('workspace.sageIntacct.defaultVendor'),
            key: 'Default vendor toggle',
            subtitle: translate('workspace.sageIntacct.defaultVendorDescription', {isReimbursable: true}),
            isActive: !!config?.export.reimbursableExpenseReportDefaultVendor,
            switchAccessibilityLabel: translate('workspace.sageIntacct.defaultVendor'),
            onToggle: (enabled) => {
                const vendor = enabled ? policy?.connections?.intacct?.data?.vendors?.[0].id ?? '' : '';
                updateSageIntacctDefaultVendor(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR, vendor, config?.export.reimbursableExpenseReportDefaultVendor);
            },
            onCloseError: () => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR),
            pendingAction: settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR], config?.pendingFields),
            errors: ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR),
            shouldHide: reimbursable !== CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT,
        },
        {
            type: 'menuitem',
            title: defaultVendorName && defaultVendorName !== '' ? defaultVendorName : translate('workspace.sageIntacct.notConfigured'),
            description: translate('workspace.sageIntacct.defaultVendor'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR],
            shouldHide: reimbursable !== CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT || !reimbursableExpenseReportDefaultVendor,
        },
    ];

    return (
        <ConnectionLayout
            displayName={SageIntacctReimbursableExpensesPage.displayName}
            headerTitle="workspace.accounting.exportOutOfPocket"
            title="workspace.sageIntacct.reimbursableExpenses.description"
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            {menuItems
                .filter((item) => !item.shouldHide)
                .map((item) => {
                    switch (item.type) {
                        case 'toggle':
                            // eslint-disable-next-line no-case-declarations
                            const {type, shouldHide, key, ...rest} = item;
                            return (
                                <ToggleSettingOptionRow
                                    key={key}
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

SageIntacctReimbursableExpensesPage.displayName = 'SageIntacctReimbursableExpensesPage';

export default withPolicyConnections(SageIntacctReimbursableExpensesPage);
