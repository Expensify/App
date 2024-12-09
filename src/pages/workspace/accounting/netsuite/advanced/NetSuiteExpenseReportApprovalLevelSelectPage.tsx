import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_REPORTS_APPROVAL_LEVEL>;
};

function NetSuiteExpenseReportApprovalLevelSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const config = policy?.connections?.netsuite.options.config;
    const data: MenuListItem[] = Object.values(CONST.NETSUITE_REPORTS_APPROVAL_LEVEL).map((approvalType) => ({
        value: approvalType,
        text: translate(`workspace.netsuite.advancedConfig.exportReportsTo.values.${approvalType}`),
        keyForList: approvalType,
        isSelected: config?.syncOptions.exportReportsTo === approvalType,
    }));

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.exportReportsTo.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectExpenseReportApprovalLevel = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.syncOptions.exportReportsTo) {
                Connections.updateNetSuiteExportReportsTo(policyID, row.value, config?.syncOptions.exportReportsTo ?? CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [config?.syncOptions.exportReportsTo, policyID],
    );

    return (
        <SelectionScreen
            displayName={NetSuiteExpenseReportApprovalLevelSelectPage.displayName}
            title="workspace.netsuite.advancedConfig.exportReportsTo.label"
            headerContent={headerContent}
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExpenseReportApprovalLevel(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO)}
        />
    );
}

NetSuiteExpenseReportApprovalLevelSelectPage.displayName = 'NetSuiteExpenseReportApprovalLevelSelectPage';

export default withPolicyConnections(NetSuiteExpenseReportApprovalLevelSelectPage);
