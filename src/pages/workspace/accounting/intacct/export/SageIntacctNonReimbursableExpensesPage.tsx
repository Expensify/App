import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, getSageIntacctNonReimbursableActiveDefaultVendor, settingsPendingAction} from '@libs/PolicyUtils';

import type {MenuItemToRender} from '@pages/workspace/accounting/intacct/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import {getDefaultVendorName} from './utils';

function SageIntacctNonReimbursableExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};

    const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
    const defaultVendorName = getDefaultVendorName(activeDefaultVendor, intacctData?.vendors);
    const defaultVendorSettingName =
        config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
            ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
            : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES>>();
    const backTo = route.params?.backTo;

    const isDefaultVendorSet = !!(defaultVendorName && defaultVendorName !== '');

    const renderDefault = (item: MenuItemToRender) => {
        return (
            <OfflineWithFeedback
                key={item.description}
                pendingAction={settingsPendingAction(item.subscribedSettings, config?.pendingFields)}
                errors={item.errors}
                onClose={item.onCloseError}
            >
                <MenuItemWithTopDescription
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    helperText={item.helperText}
                    shouldShowRightIcon
                    onPress={item?.onPress}
                    brickRoadIndicator={areSettingsInErrorFields(item.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        );
    };

    const menuItems: MenuItemToRender[] = [
        {
            type: 'menuitem',
            title: config?.export.nonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${config?.export.nonReimbursable}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => {
                if (!policyID) {
                    return;
                }

                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION.path));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE],
        },
        {
            type: 'menuitem',
            title: config?.export.nonReimbursableAccount ? config.export.nonReimbursableAccount : undefined,
            description: translate('workspace.sageIntacct.creditCardAccount'),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT.path));
            },
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT],
            shouldHide: config?.export.nonReimbursable !== CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE,
        },
        {
            type: 'menuitem',
            title: defaultVendorName && defaultVendorName !== '' ? defaultVendorName : undefined,
            description: translate('workspace.sageIntacct.defaultVendor'),
            helperText:
                config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE
                    ? translate('workspace.accounting.defaultVendorHelperText', {isSet: isDefaultVendorSet})
                    : undefined,
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE.toLowerCase())));
            },
            subscribedSettings: [defaultVendorSettingName],
            errors: getLatestErrorField(config, defaultVendorSettingName),
            onCloseError: () => {
                if (!policyID) {
                    return;
                }
                clearSageIntacctErrorField(policyID, defaultVendorSettingName);
            },
            shouldHide: !config?.export.nonReimbursable,
        },
    ];

    return (
        <ConnectionLayout
            displayName="SageIntacctNonReimbursableExpensesPage"
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.sageIntacct.nonReimbursableExpenses.description"
            onBackButtonPress={() =>
                Navigation.goBack(backTo ?? (policyID && createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID))))
            }
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            {menuItems.filter((item) => !item.shouldHide).map((item) => renderDefault(item))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(SageIntacctNonReimbursableExpensesPage);
