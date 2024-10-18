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
import * as ConnectionUtils from '@libs/ConnectionUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function QuickbooksDesktopCompanyCardExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {canUseNewDotQBD} = usePermissions();
    const nonReimbursable = qbdConfig?.export?.nonReimbursable;
    const nonReimbursableAccount = qbdConfig?.export?.nonReimbursableAccount;

    const data: CardListItem[] = useMemo(() => {
        const accounts = getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop, nonReimbursable);
        return accounts.map((card) => ({
            value: card,
            text: card.name,
            keyForList: card.name,
            isSelected: card.id === nonReimbursableAccount,
        }));
    }, [policy?.connections?.quickbooksDesktop, nonReimbursable, nonReimbursableAccount]);

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== nonReimbursableAccount) {
                QuickbooksDesktop.updateQuickbooksDesktopNonReimbursableExpensesAccount(policyID, row.value.id, nonReimbursableAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableAccount, policyID],
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
            displayName={QuickbooksDesktopCompanyCardExpenseAccountSelectPage.displayName}
            headerTitleAlreadyTranslated={ConnectionUtils.getQBDNonReimbursableExportAccountType(nonReimbursable)}
            headerContent={nonReimbursable ? <Text style={[styles.ph5, styles.pb5]}>{translate(`workspace.qbd.accounts.${nonReimbursable}AccountDescription`)}</Text> : null}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            sections={data.length ? [{data}] : []}
            listItem={RadioListItem}
            onSelectRow={selectExportAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID))}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT], qbdConfig?.pendingFields)}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
        />
    );
}

QuickbooksDesktopCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountSelectPage';

export default withPolicyConnections(QuickbooksDesktopCompanyCardExpenseAccountSelectPage);
