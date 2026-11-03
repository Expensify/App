import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksDesktopReimbursableExpensesAccount} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearQBDErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Account} from '@src/types/onyx/Policy';

import React from 'react';

type CardListItem = ListItem & {
    value: Account;
};

function DynamicQuickbooksDesktopOutOfPocketExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_OUT_OF_POCKET_EXPENSE_ACCOUNT_SELECT.path);

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
            titleText = 'workspace.qbd.account';
            break;
    }
    const [title, description]: [TranslationPaths | undefined, string | undefined] = [titleText, descriptionText];

    const accounts = getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop);
    const data: CardListItem[] = accounts.map((account) => ({
        value: account,
        text: account.name,
        keyForList: account.name,
        isSelected: account.id === qbdConfig?.export?.reimbursableAccount,
    }));

    const policyID = policy?.id;

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const selectExportAccount = (row: CardListItem) => {
        if (row.value.id !== qbdConfig?.export?.reimbursableAccount && policyID) {
            updateQuickbooksDesktopReimbursableExpensesAccount(policyID, row.value.id, qbdConfig?.export?.reimbursableAccount);
        }
        goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.qbd.noAccountsFound')}
            subtitle={translate('workspace.qbd.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DynamicQuickbooksDesktopOutOfPocketExpenseAccountSelectPage"
            data={data}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{description}</Text>}
            onBackButtonPress={goBack}
            onSelectRow={selectExportAccount}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title={title}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT)}
            listEmptyContent={listEmptyContent}
            shouldSingleExecuteRowSelect
        />
    );
}

export default withPolicyConnections(DynamicQuickbooksDesktopOutOfPocketExpenseAccountSelectPage);
