import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopNonReimbursableExpensesAccount} from '@libs/actions/connections/QuickbooksDesktop';
import {getQBDNonReimbursableExportAccountType} from '@libs/ConnectionUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};

function QuickbooksDesktopCompanyCardExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const nonReimbursable = qbdConfig?.export?.nonReimbursable;
    const nonReimbursableAccount = qbdConfig?.export?.nonReimbursableAccount;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT>>();
    const backTo = route.params?.backTo;
    const illustrations = useMemoizedLazyIllustrations(['Telescope'] as const);
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
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)));
    }, [policyID, backTo]);

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
            displayName={QuickbooksDesktopCompanyCardExpenseAccountSelectPage.displayName}
            headerTitleAlreadyTranslated={getQBDNonReimbursableExportAccountType(translate, nonReimbursable)}
            headerContent={nonReimbursable ? <Text style={[styles.ph5, styles.pb5]}>{translate(`workspace.qbd.accounts.${nonReimbursable}AccountDescription`)}</Text> : null}
            sections={data.length ? [{data}] : []}
            listItem={RadioListItem}
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

QuickbooksDesktopCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountSelectPage';

export default withPolicyConnections(QuickbooksDesktopCompanyCardExpenseAccountSelectPage);
