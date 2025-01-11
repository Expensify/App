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

function NetSuiteQuickStartExportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config; // s77rt
    const s77rt1 = CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE; // s77rt
    const s77rt2 = 'zach@cathyscroissants.com'; // s77rt

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NetSuiteQuickStartExportPage.displayName}
            headerTitle="workspace.accounting.export"
            title="workspace.nsqs.export.description"
            titleStyle={styles.pb3}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
        >
            <MenuItemWithTopDescription
                title={s77rt2}
                description={translate('workspace.accounting.preferredExporter')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
                shouldShowRightIcon
                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT_PREFERRED_EXPORTER.getRoute(policyID))}
            />
            <View style={[styles.sectionDividerLine, styles.mv3]} />
            <MenuItemWithTopDescription
                title={translate(`workspace.nsqs.export.exportDate.values.${s77rt1}.label`)}
                description={translate('common.date')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
                shouldShowRightIcon
                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT_DATE.getRoute(policyID))}
            />
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.nsqs.export.expense')}
                description={translate('workspace.nsqs.export.reimbursableExpenses')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
            />
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.nsqs.export.expense')}
                description={translate('workspace.nsqs.export.nonReimbursableExpenses')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
            />
        </ConnectionLayout>
    );
}

NetSuiteQuickStartExportPage.displayName = 'NetSuiteQuickStartExportPage';

export default withPolicyConnections(NetSuiteQuickStartExportPage);
