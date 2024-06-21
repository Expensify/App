import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuitePayableAccountOptions} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type RouteParams = {
    expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
};

function NetSuiteExportExpensesPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const route = useRoute();
    const params = route.params as RouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const config = policy?.connections?.netsuite.options.config;
    const currentValue = isReimbursable ? config?.reimbursablePayableAccount : config?.payableAcct;
    const netsuitePayableAccountOptions = useMemo<SelectorType[]>(() => getNetSuitePayableAccountOptions(policy ?? undefined, currentValue), [currentValue, policy]);

    const initiallyFocusedOptionKey = useMemo(() => netsuitePayableAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuitePayableAccountOptions]);

    const updatePayableAccount = useCallback(
        ({value}: SelectorType) => {
            if (currentValue !== value) {
                if (isReimbursable) {
                    Connections.updateNetSuiteReimbursablePayableAccount(policyID, policy?.connections?.netsuite.tokenSecret ?? '', value, currentValue ?? '');
                } else {
                    Connections.updateNetSuitePayableAcct(policyID, policy?.connections?.netsuite.tokenSecret ?? '', value, currentValue ?? '');
                }
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
        },
        [currentValue, policyID, params.expenseType, isReimbursable, policy?.connections?.netsuite.tokenSecret],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noAccountsFound')}
                subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteExportExpensesPayableAccountSelectPage.displayName}
            sections={netsuitePayableAccountOptions.length ? [{data: netsuitePayableAccountOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updatePayableAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType))}
            title={isReimbursable ? 'workspace.netsuite.reimbursableJournalPostingAccount' : 'workspace.netsuite.nonReimbursableJournalPostingAccount'}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={
                isReimbursable
                    ? config?.reimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
                    : config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
            }
        />
    );
}

NetSuiteExportExpensesPayableAccountSelectPage.displayName = 'NetSuiteExportExpensesPayableAccountSelectPage';

export default withPolicyConnections(NetSuiteExportExpensesPayableAccountSelectPage);
