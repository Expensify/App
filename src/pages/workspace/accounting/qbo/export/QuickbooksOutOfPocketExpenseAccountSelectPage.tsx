import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function QuickbooksOutOfPocketExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {bankAccounts, journalEntryAccounts, accountPayable} = policy?.connections?.quickbooksOnline?.data ?? {};

    const {reimbursableExpensesExportDestination, reimbursableExpensesAccount} = policy?.connections?.quickbooksOnline?.config ?? {};

    const data: CardListItem[] = useMemo(() => {
        let accounts: Account[];
        switch (reimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                accounts = bankAccounts ?? [];
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                accounts = accountPayable ?? [];
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                accounts = journalEntryAccounts ?? [];
                break;
            default:
                accounts = [];
        }

        return accounts.map((account) => ({
            value: account,
            text: account.name,
            keyForList: account.name,
            isSelected: account.id === reimbursableExpensesAccount?.id,
        }));
    }, [accountPayable, bankAccounts, reimbursableExpensesExportDestination, reimbursableExpensesAccount, journalEntryAccounts]);

    const policyID = policy?.id ?? '';

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== reimbursableExpensesAccount?.id) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [reimbursableExpensesAccount, policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={QuickbooksOutOfPocketExpenseAccountSelectPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.qbo.accountsPayable')} />
                <SelectionList
                    headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.accountsPayableDescription')}</Text>}
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={selectExportAccount}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksOutOfPocketExpenseAccountSelectPage.displayName = 'QuickbooksOutOfPocketExpenseAccountSelectPage';

export default withPolicyConnections(QuickbooksOutOfPocketExpenseAccountSelectPage);
