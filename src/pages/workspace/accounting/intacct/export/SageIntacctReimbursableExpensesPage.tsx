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
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>;
};

function SageIntacctReimbursableExpensesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {reimbursable} = policy?.connections?.intacct?.config?.export ?? {};
    const data: MenuListItem[] = Object.values(CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE).map((expenseType) => ({
        value: expenseType,
        text: translate(`workspace.sageIntacct.reimbursableExpenses.values.${expenseType}`),
        keyForList: expenseType,
        isSelected: reimbursable === expenseType,
    }));

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.sageIntacct.reimbursableExpenses.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectExportDate = useCallback(
        (row: MenuListItem) => {
            if (row.value !== reimbursable) {
                // TODO: change CONST.XERO_CONFIG.EXPORT to CONST.SAGE_INTACCT.EXPORT
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST.XERO_CONFIG.EXPORT, {reimbursable: row.value});
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID));
        },
        [reimbursable, policyID],
    );

    return (
        <SelectionScreen
            displayName={SageIntacctReimbursableExpensesPage.displayName}
            title="workspace.sageIntacct.reimbursableExpenses.label"
            headerContent={headerContent}
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportDate(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        />
    );
}

SageIntacctReimbursableExpensesPage.displayName = 'PolicySageIntacctReimbursableExpensesPage';

export default withPolicyConnections(SageIntacctReimbursableExpensesPage);
