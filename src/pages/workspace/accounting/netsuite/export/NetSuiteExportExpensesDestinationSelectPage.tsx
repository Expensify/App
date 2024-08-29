import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@navigation/Navigation';
import type {ExpenseRouteParams} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>;
};

function NetSuiteExportExpensesDestinationSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const config = policy?.connections?.netsuite.options.config;

    const route = useRoute();
    const params = route.params as ExpenseRouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const currentDestination = isReimbursable ? config?.reimbursableExpensesExportDestination : config?.nonreimbursableExpensesExportDestination;

    const data: MenuListItem[] = Object.values(CONST.NETSUITE_EXPORT_DESTINATION).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.netsuite.exportDestination.values.${dateType}.label`),
        keyForList: dateType,
        isSelected: currentDestination === dateType,
    }));

    const selectDestination = useCallback(
        (row: MenuListItem) => {
            if (row.value !== currentDestination) {
                if (isReimbursable) {
                    Connections.updateNetSuiteReimbursableExpensesExportDestination(policyID, row.value, currentDestination ?? CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT);
                } else {
                    Connections.updateNetSuiteNonReimbursableExpensesExportDestination(policyID, row.value, currentDestination ?? CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
                }
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
        },
        [currentDestination, isReimbursable, params.expenseType, policyID],
    );

    return (
        <SelectionScreen
            displayName={NetSuiteExportExpensesDestinationSelectPage.displayName}
            title="workspace.accounting.exportAs"
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectDestination(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        />
    );
}

NetSuiteExportExpensesDestinationSelectPage.displayName = 'NetSuiteExportExpensesDestinationSelectPage';

export default withPolicyConnections(NetSuiteExportExpensesDestinationSelectPage);
