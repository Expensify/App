import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {changeMappingsValueFromDefaultToTag, updateSageIntacctReimbursableExpensesExportDestination} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>;
};

function SageIntacctReimbursableExpensesDestinationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {config} = policy?.connections?.intacct ?? {};

    const data: MenuListItem[] = Object.values(CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE).map((expenseType) => ({
        value: expenseType,
        text: translate(`workspace.sageIntacct.reimbursableExpenses.values.${expenseType}`),
        keyForList: expenseType,
        isSelected: config?.export.reimbursable === expenseType,
    }));

    const selectDestination = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.export.reimbursable) {
                updateSageIntacctReimbursableExpensesExportDestination(policyID, row.value, config?.export.reimbursable);
                if (row.value === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL) {
                    // Employee default mapping value is not allowed when expense type is VENDOR_BILL, so we have to change mapping value to Tag
                    changeMappingsValueFromDefaultToTag(policyID, config?.mappings);
                }
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID));
        },
        [config?.export.reimbursable, config?.mappings, policyID],
    );

    return (
        <SelectionScreen
            displayName={SageIntacctReimbursableExpensesDestinationPage.displayName}
            title="workspace.accounting.exportAs"
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectDestination(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE)}
        />
    );
}

SageIntacctReimbursableExpensesDestinationPage.displayName = 'SageIntacctReimbursableExpensesDestinationPage';

export default withPolicyConnections(SageIntacctReimbursableExpensesDestinationPage);
