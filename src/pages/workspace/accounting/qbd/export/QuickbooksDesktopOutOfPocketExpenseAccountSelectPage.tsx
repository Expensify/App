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
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
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
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;

    const {canUseNewDotQBD} = usePermissions();

    const [title, description] = useMemo(() => {
        let titleText: TranslationPaths | undefined;
        let descriptionText: string | undefined;
        switch (qbdConfig?.export.reimbursable) {
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                titleText = 'workspace.qbd.bankAccount';
                descriptionText = translate('workspace.qbd.bankAccountDescription');
                break;
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                titleText = 'workspace.qbd.account';
                descriptionText = translate('workspace.qbd.accountDescription');
                break;
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                titleText = 'workspace.qbd.accountsPayable';
                descriptionText = translate('workspace.qbd.accountsPayableDescription');
                break;
            default:
                break;
        }

        return [titleText, descriptionText];
    }, [qbdConfig?.export.reimbursable, translate]);

    const data: CardListItem[] = useMemo(() => {
        const accounts = getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop);
        return accounts.map((account) => ({
            value: account,
            text: account.name,
            keyForList: account.name,
            isSelected: account.id === qbdConfig?.export?.reimbursableAccount,
        }));
    }, [policy?.connections?.quickbooksDesktop, qbdConfig?.export?.reimbursableAccount]);

    const policyID = policy?.id ?? '-1';

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== qbdConfig?.export?.reimbursableAccount) {
                QuickbooksDesktop.updateQuickbooksDesktopReimbursableExpensesAccount(policyID, row.value.id, qbdConfig?.export?.reimbursableAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [qbdConfig?.export?.reimbursableAccount, policyID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbd.noAccountsFound')}
                subtitle={translate('workspace.qbd.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopOutOfPocketExpenseAccountSelectPage.displayName}
            sections={data.length ? [{data}] : []}
            listItem={RadioListItem}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{description}</Text>}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID))}
            onSelectRow={selectExportAccount}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title={title}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT)}
            listEmptyContent={listEmptyContent}
            shouldSingleExecuteRowSelect
        />
    );
}

QuickbooksDesktopOutOfPocketExpenseAccountSelectPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseAccountSelectPage';

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseAccountSelectPage);
