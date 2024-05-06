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

function QuickbooksCompanyCardExpenseAccountPayableSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {accountPayable} = policy?.connections?.quickbooksOnline?.data ?? {};
    const {nonReimbursableExpensesAccount} = policy?.connections?.quickbooksOnline?.config ?? {};

    const policyID = policy?.id ?? '';
    const sections = useMemo(() => {
        const data: CardListItem[] =
            accountPayable?.map((account) => ({
                value: account,
                text: account.name,
                keyForList: account.name,
                isSelected: account.id === nonReimbursableExpensesAccount?.id,
            })) ?? [];
        return [{data}];
    }, [nonReimbursableExpensesAccount, accountPayable]);

    const selectAccountPayable = useCallback(
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
            <ScreenWrapper testID={QuickbooksCompanyCardExpenseAccountPayableSelectPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.qbo.accountsPayable')} />
                <SelectionList
                    headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.accountsPayableDescription')}</Text>}
                    sections={sections}
                    ListItem={RadioListItem}
                    onSelectRow={selectAccountPayable}
                    initiallyFocusedOptionKey={sections[0].data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountPayableSelectPage.displayName = 'QuickbooksCompanyCardExpenseAccountPayableSelectPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountPayableSelectPage);
