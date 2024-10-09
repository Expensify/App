import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuitePayableAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {ExpenseRouteParams} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteExportExpensesPayableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const route = useRoute();
    const params = route.params as ExpenseRouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const config = policy?.connections?.netsuite.options.config;
    const currentSettingName = isReimbursable ? CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT : CONST.NETSUITE_CONFIG.PAYABLE_ACCT;
    const currentPayableAccountID = config?.[currentSettingName];
    const netsuitePayableAccountOptions = useMemo<SelectorType[]>(() => getNetSuitePayableAccountOptions(policy ?? undefined, currentPayableAccountID), [currentPayableAccountID, policy]);

    const initiallyFocusedOptionKey = useMemo(() => netsuitePayableAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuitePayableAccountOptions]);

    const updatePayableAccount = useCallback(
        ({value}: SelectorType) => {
            if (currentPayableAccountID !== value) {
                if (isReimbursable) {
                    Connections.updateNetSuiteReimbursablePayableAccount(policyID, value, currentPayableAccountID);
                } else {
                    Connections.updateNetSuitePayableAcct(policyID, value, currentPayableAccountID);
                }
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
        },
        [currentPayableAccountID, policyID, params.expenseType, isReimbursable],
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
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
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
            pendingAction={settingsPendingAction([currentSettingName], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, currentSettingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNetSuiteErrorField(policyID, currentSettingName)}
        />
    );
}

NetSuiteExportExpensesPayableAccountSelectPage.displayName = 'NetSuiteExportExpensesPayableAccountSelectPage';

export default withPolicyConnections(NetSuiteExportExpensesPayableAccountSelectPage);
