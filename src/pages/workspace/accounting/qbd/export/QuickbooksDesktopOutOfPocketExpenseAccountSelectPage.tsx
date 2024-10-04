import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};
function QuickbooksDesktopOutOfPocketExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {bankAccounts, journalEntryAccounts, accountPayable} = policy?.connections?.quickbooksOnline?.data ?? {}; // TODO: should be updated to use the new connections object;
    const qbdConfig = policy?.connections?.quickbooksOnline?.config; // TODO: should be updated to use the new connections object;

    const {canUseNewDotQBD} = usePermissions();

    const [title, description] = useMemo(() => {
        let titleText: TranslationPaths | undefined;
        let descriptionText: string | undefined;
        switch (qbdConfig?.reimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                titleText = 'workspace.qbo.bankAccount';
                descriptionText = translate('workspace.qbo.bankAccountDescription');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                titleText = 'workspace.qbo.account';
                descriptionText = translate('workspace.qbo.accountDescription');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                titleText = 'workspace.qbo.accountsPayable';
                descriptionText = translate('workspace.qbo.accountsPayableDescription');
                break;
            default:
                break;
        }

        return [titleText, descriptionText];
    }, [qbdConfig?.reimbursableExpensesExportDestination, translate]);

    const data: CardListItem[] = useMemo(() => {
        let accounts: Account[];
        switch (qbdConfig?.reimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                accounts = bankAccounts ?? [];
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                accounts = journalEntryAccounts ?? [];
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                accounts = accountPayable ?? [];
                break;
            default:
                accounts = [];
        }

        return accounts.map((account) => ({
            value: account,
            text: account.name,
            keyForList: account.name,
            isSelected: account.id === qbdConfig?.reimbursableExpensesAccount?.id,
        }));
    }, [qbdConfig?.reimbursableExpensesExportDestination, qbdConfig?.reimbursableExpensesAccount?.id, bankAccounts, journalEntryAccounts, accountPayable]);

    const policyID = policy?.id ?? '-1';

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== qbdConfig?.reimbursableExpensesAccount?.id) {
                QuickbooksDesktop.updateQuickbooksDesktopReimbursableExpensesAccount(policyID, row.value, qbdConfig?.reimbursableExpensesAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [qbdConfig?.reimbursableExpensesAccount, policyID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbo.noAccountsFound')}
                subtitle={translate('workspace.qbo.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    const accessVariants = canUseNewDotQBD ? [] : [CONST.POLICY.ACCESS_VARIANTS.ADMIN];

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopOutOfPocketExpenseAccountSelectPage.displayName}
            sections={data.length ? [{data}] : []}
            listItem={RadioListItem}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{description}</Text>}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID))}
            onSelectRow={selectExportAccount}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title={title}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO} // TODO: should be updated to use the new connection
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT], qbdConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT)}
            listEmptyContent={listEmptyContent}
            shouldSingleExecuteRowSelect
        />
    );
}

QuickbooksDesktopOutOfPocketExpenseAccountSelectPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseAccountSelectPage';

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseAccountSelectPage);
