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
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL>;
};

function NetSuiteVendorBillApprovalLevelSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const config = policy?.connections?.netsuite.options.config;
    const data: MenuListItem[] = Object.values(CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL).map((approvalType) => ({
        value: approvalType,
        text: translate(`workspace.netsuite.advancedConfig.exportVendorBillsTo.values.${approvalType}`),
        keyForList: approvalType,
        isSelected: config?.syncOptions.exportVendorBillsTo === approvalType,
    }));

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.exportVendorBillsTo.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectVendorBillApprovalLevel = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.syncOptions.exportVendorBillsTo) {
                Connections.updateNetSuiteExportVendorBillsTo(
                    policyID,
                    row.value,
                    config?.syncOptions.exportVendorBillsTo ?? CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE,
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [config?.syncOptions.exportVendorBillsTo, policyID],
    );

    return (
        <SelectionScreen
            displayName={NetSuiteVendorBillApprovalLevelSelectPage.displayName}
            title="workspace.netsuite.advancedConfig.exportVendorBillsTo.label"
            headerContent={headerContent}
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectVendorBillApprovalLevel(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={
                config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL &&
                config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL
            }
        />
    );
}

NetSuiteVendorBillApprovalLevelSelectPage.displayName = 'NetSuiteVendorBillApprovalLevelSelectPage';

export default withPolicyConnections(NetSuiteVendorBillApprovalLevelSelectPage);
