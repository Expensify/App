import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineReimbursableExpensesAccount} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function DynamicQuickbooksOutOfPocketExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {bankAccounts, journalEntryAccounts, accountPayable} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.path);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [title, description] = useMemo(() => {
        let titleText: TranslationPaths | undefined;
        let descriptionText: string | undefined;
        switch (qboConfig?.reimbursableExpensesExportDestination) {
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
                titleText = 'workspace.qbo.account';
                break;
        }

        return [titleText, descriptionText];
    }, [qboConfig?.reimbursableExpensesExportDestination, translate]);

    const data: CardListItem[] = useMemo(() => {
        let accounts: Account[];
        switch (qboConfig?.reimbursableExpensesExportDestination) {
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
            isSelected: account.id === qboConfig?.reimbursableExpensesAccount?.id,
        }));
    }, [qboConfig?.reimbursableExpensesExportDestination, qboConfig?.reimbursableExpensesAccount?.id, bankAccounts, journalEntryAccounts, accountPayable]);

    const policyID = policy?.id;

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== qboConfig?.reimbursableExpensesAccount?.id && policyID) {
                updateQuickbooksOnlineReimbursableExpensesAccount(policyID, row.value, qboConfig?.reimbursableExpensesAccount);
            }
            goBack();
        },
        [qboConfig?.reimbursableExpensesAccount, policyID, goBack],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbo.noAccountsFound')}
                subtitle={translate('workspace.qbo.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10, illustrations.Telescope],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksOutOfPocketExpenseAccountSelectPage"
            data={data}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{description}</Text>}
            onBackButtonPress={goBack}
            onSelectRow={selectExportAccount}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title={title}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT)}
            listEmptyContent={listEmptyContent}
            shouldSingleExecuteRowSelect
        />
    );
}

export default withPolicyConnections(DynamicQuickbooksOutOfPocketExpenseAccountSelectPage);
