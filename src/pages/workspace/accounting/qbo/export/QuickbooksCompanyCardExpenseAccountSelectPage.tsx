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

function QuickbooksCompanyCardExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {creditCards, vendors, bankAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};

    const {nonReimbursableExpensesAccount, nonReimbursableExpensesExportDestination} = policy?.connections?.quickbooksOnline?.config ?? {};

    const data: CardListItem[] = useMemo(() => {
        let accounts: Account[];
        switch (nonReimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
                accounts = creditCards ?? [];
                break;
            case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
                accounts = bankAccounts ?? [];
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                accounts = vendors ?? [];
                break;
            default:
                accounts = [];
        }

        return accounts.map((card) => ({
            value: card,
            text: card.name,
            keyForList: card.name,
            isSelected: card.name === nonReimbursableExpensesAccount?.name,
        }));
    }, [nonReimbursableExpensesAccount, creditCards, bankAccounts, nonReimbursableExpensesExportDestination, vendors]);

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== nonReimbursableExpensesAccount?.id) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableExpensesAccount, policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={QuickbooksCompanyCardExpenseAccountSelectPage.displayName}>
                <HeaderWithBackButton
                    title={
                        nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL
                            ? translate('workspace.qbo.vendor')
                            : translate('workspace.qbo.account')
                    }
                />
                <SelectionList
                    headerContent={
                        nonReimbursableExpensesExportDestination ? (
                            <Text style={[styles.ph5, styles.pb5]}>{translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}AccountDescription`)}</Text>
                        ) : null
                    }
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={selectExportAccount}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountSelectPage);
