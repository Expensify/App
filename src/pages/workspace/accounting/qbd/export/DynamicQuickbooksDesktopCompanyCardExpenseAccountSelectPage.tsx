import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopNonReimbursableExpensesAccount} from '@libs/actions/connections/QuickbooksDesktop';
import {getQBDNonReimbursableExportAccountType} from '@libs/ConnectionUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function DynamicQuickbooksDesktopCompanyCardExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const nonReimbursable = qbdConfig?.export?.nonReimbursable;
    const nonReimbursableAccount = qbdConfig?.export?.nonReimbursableAccount;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.path);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const data: CardListItem[] = useMemo(() => {
        const accounts = getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop, nonReimbursable);
        return accounts.map((card) => ({
            value: card,
            text: card.name,
            keyForList: card.name,
            // We use the logical OR (||) here instead of ?? because `nonReimbursableAccount` can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            isSelected: card.id === (nonReimbursableAccount || accounts.at(0)?.id),
        }));
    }, [policy?.connections?.quickbooksDesktop, nonReimbursable, nonReimbursableAccount]);

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== nonReimbursableAccount && policyID) {
                updateQuickbooksDesktopNonReimbursableExpensesAccount(policyID, row.value.id, nonReimbursableAccount);
            }
            goBack();
        },
        [nonReimbursableAccount, policyID, goBack],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbd.noAccountsFound')}
                subtitle={translate('workspace.qbd.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10, illustrations.Telescope],
    );
    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DynamicQuickbooksDesktopCompanyCardExpenseAccountSelectPage"
            headerTitleAlreadyTranslated={getQBDNonReimbursableExportAccountType(translate, nonReimbursable)}
            headerContent={nonReimbursable ? <Text style={[styles.ph5, styles.pb5]}>{translate(`workspace.qbd.accounts.${nonReimbursable}AccountDescription`)}</Text> : null}
            data={data}
            onSelectRow={selectExportAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={goBack}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT], qbdConfig?.pendingFields)}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(DynamicQuickbooksDesktopCompanyCardExpenseAccountSelectPage);
