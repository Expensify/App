import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineNonReimbursableExpensesAccount} from '@libs/actions/connections/QuickbooksOnline';
import {getQBONonReimbursableExportAccountType} from '@libs/ConnectionUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function QuickbooksCompanyCardExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const {creditCards, accountPayable, bankAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT>>();
    const backTo = route.params?.backTo;

    const data: CardListItem[] = useMemo(() => {
        let accounts: Account[];
        switch (qboConfig?.nonReimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
                accounts = creditCards ?? [];
                break;
            case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
                accounts = bankAccounts ?? [];
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                accounts = accountPayable ?? [];
                break;
            default:
                accounts = [];
        }

        return accounts.map((card) => ({
            value: card,
            text: card.name,
            keyForList: card.name,
            isSelected: card.name === qboConfig?.nonReimbursableExpensesAccount?.name,
        }));
    }, [qboConfig?.nonReimbursableExpensesAccount, creditCards, bankAccounts, qboConfig?.nonReimbursableExpensesExportDestination, accountPayable]);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)));
    }, [policyID, backTo]);

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== qboConfig?.nonReimbursableExpensesAccount?.id && policyID) {
                updateQuickbooksOnlineNonReimbursableExpensesAccount(policyID, row.value, qboConfig?.nonReimbursableExpensesAccount);
            }
            goBack();
        },
        [qboConfig?.nonReimbursableExpensesAccount, policyID, goBack],
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
            displayName="QuickbooksCompanyCardExpenseAccountSelectPage"
            headerTitleAlreadyTranslated={getQBONonReimbursableExportAccountType(translate, qboConfig?.nonReimbursableExpensesExportDestination)}
            headerContent={
                qboConfig?.nonReimbursableExpensesExportDestination ? (
                    <Text style={[styles.ph5, styles.pb5]}>{translate(`workspace.qbo.accounts.${qboConfig?.nonReimbursableExpensesExportDestination}AccountDescription`)}</Text>
                ) : null
            }
            data={data}
            listItem={RadioListItem}
            onSelectRow={selectExportAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={goBack}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT], qboConfig?.pendingFields)}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountSelectPage);
