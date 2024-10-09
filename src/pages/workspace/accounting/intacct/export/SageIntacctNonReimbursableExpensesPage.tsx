import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, getSageIntacctNonReimbursableActiveDefaultVendor, settingsPendingAction} from '@libs/PolicyUtils';
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

function SageIntacctNonReimbursableExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};

    const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
    const defaultVendorName = getDefaultVendorName(activeDefaultVendor, intacctData?.vendors);

    const menuItems: Array<MenuItemWithSubscribedSettings | ToggleItemWithKey> = [
        {
            type: 'menuitem',
            title: config?.export.nonReimbursable
                ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${config?.export.nonReimbursable}`)
                : translate('workspace.sageIntacct.notConfigured'),
            description: translate('workspace.accounting.exportAs'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION.getRoute(policyID));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE],
        },
        {
            type: 'menuitem',
            title: config?.export.nonReimbursableAccount ? config.export.nonReimbursableAccount : translate('workspace.sageIntacct.notConfigured'),
            description: translate('workspace.sageIntacct.creditCardAccount'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT.getRoute(policyID));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT],
            shouldHide: config?.export.nonReimbursable !== CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
        },
        {
            type: 'toggle',
            title: translate('workspace.sageIntacct.defaultVendor'),
            key: 'Default vendor toggle',
            subtitle: translate('workspace.sageIntacct.defaultVendorDescription', {isReimbursable: false}),
            isActive: !!config?.export.nonReimbursableCreditCardChargeDefaultVendor,
            switchAccessibilityLabel: translate('workspace.sageIntacct.defaultVendor'),
            onToggle: (enabled) => {
                const vendor = enabled ? policy?.connections?.intacct?.data?.vendors?.[0].id : '';
                updateSageIntacctDefaultVendor(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR, vendor, config?.export.nonReimbursableCreditCardChargeDefaultVendor);
            },
            onCloseError: () => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR),
            pendingAction: settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR], config?.pendingFields),
            errors: ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR),
            shouldHide: config?.export.nonReimbursable !== CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
        },
        {
            type: 'menuitem',
            title: defaultVendorName && defaultVendorName !== '' ? defaultVendorName : translate('workspace.sageIntacct.notConfigured'),
            description: translate('workspace.sageIntacct.defaultVendor'),
            onPress: () => {
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE.toLowerCase()));
            },
            subscribedSettings: [
                config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                    ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                    : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
            ],
            shouldHide:
                !config?.export.nonReimbursable ||
                (config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE && !config?.export.nonReimbursableCreditCardChargeDefaultVendor),
        },
    ];

    return (
        <ConnectionLayout
            displayName={SageIntacctNonReimbursableExpensesPage.displayName}
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.sageIntacct.nonReimbursableExpenses.description"
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

SageIntacctNonReimbursableExpensesPage.displayName = 'SageIntacctNonReimbursableExpensesPage';

export default withPolicyConnections(SageIntacctNonReimbursableExpensesPage);
