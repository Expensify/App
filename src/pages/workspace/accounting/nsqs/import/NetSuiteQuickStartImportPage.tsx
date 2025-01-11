import noop from 'lodash/noop';
import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteQuickStartImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config; // s77rt
    const s77rt1 = CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG; // s77rt

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NetSuiteQuickStartImportPage.displayName}
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5, styles.gap6]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.nsqs.import.expenseCategories')}
                subtitle={translate('workspace.nsqs.import.expenseCategoriesDescription')}
                switchAccessibilityLabel={translate('workspace.nsqs.import.expenseCategories')}
                shouldPlaceSubtitleBelowSwitch
                isActive
                disabled
                onToggle={noop}
            />
            <View>
                <MenuItemWithTopDescription
                    title={translate(`workspace.accounting.importTypes.${s77rt1}`)}
                    description={translate('workspace.nsqs.import.importFields.customers.title')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_CUSTOMERS.getRoute(policyID))}
                />
                <MenuItemWithTopDescription
                    title={translate(`workspace.accounting.importTypes.${s77rt1}`)}
                    description={translate('workspace.nsqs.import.importFields.projects.title')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_PROJECTS.getRoute(policyID))}
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteQuickStartImportPage.displayName = 'NetSuiteQuickStartImportPage';

export default withPolicyConnections(NetSuiteQuickStartImportPage);
