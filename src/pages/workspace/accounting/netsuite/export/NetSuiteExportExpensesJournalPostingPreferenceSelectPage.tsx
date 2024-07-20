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
    value: ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>;
};

function NetSuiteExportExpensesJournalPostingPreferenceSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const config = policy?.connections?.netsuite.options.config;

    const route = useRoute();
    const params = route.params as ExpenseRouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const data: MenuListItem[] = Object.values(CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE).map((postingPreference) => ({
        value: postingPreference,
        text: translate(`workspace.netsuite.journalPostingPreference.values.${postingPreference}`),
        keyForList: postingPreference,
        isSelected: config?.journalPostingPreference === postingPreference,
    }));

    const selectPostingPreference = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.journalPostingPreference) {
                Connections.updateNetSuiteJournalPostingPreference(policyID, row.value, config?.journalPostingPreference);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
        },
        [config?.journalPostingPreference, params.expenseType, policyID],
    );

    return (
        <SelectionScreen
            displayName={NetSuiteExportExpensesJournalPostingPreferenceSelectPage.displayName}
            title="workspace.netsuite.journalPostingPreference.label"
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectPostingPreference(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={
                isReimbursable
                    ? config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
                    : config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
            }
        />
    );
}

NetSuiteExportExpensesJournalPostingPreferenceSelectPage.displayName = 'NetSuiteExportExpensesJournalPostingPreferenceSelectPage';

export default withPolicyConnections(NetSuiteExportExpensesJournalPostingPreferenceSelectPage);
