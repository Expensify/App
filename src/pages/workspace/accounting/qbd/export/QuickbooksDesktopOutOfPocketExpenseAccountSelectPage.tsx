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
import {updateQuickbooksDesktopReimbursableExpensesAccount} from '@libs/actions/connections/QuickbooksDesktop';
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
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx/Policy';

type CardListItem = ListItem & {
    value: Account;
};
function QuickbooksDesktopOutOfPocketExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT>>();
    const backTo = route.params?.backTo;

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
                titleText = 'workspace.qbd.account';
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
            // We use the logical OR (||) here instead of ?? because `reimbursableAccount` can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            isSelected: account.id === (qbdConfig?.export?.reimbursableAccount || accounts.at(0)?.id),
        }));
    }, [policy?.connections?.quickbooksDesktop, qbdConfig?.export?.reimbursableAccount]);

    const policyID = policy?.id;

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)));
    }, [policyID, backTo]);

    const selectExportAccount = useCallback(
        (row: CardListItem) => {
            if (row.value.id !== qbdConfig?.export?.reimbursableAccount && policyID) {
                updateQuickbooksDesktopReimbursableExpensesAccount(policyID, row.value.id, qbdConfig?.export?.reimbursableAccount);
            }
            goBack();
        },
        [qbdConfig?.export?.reimbursableAccount, policyID, goBack],
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
        [illustrations.Telescope, translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksDesktopOutOfPocketExpenseAccountSelectPage"
            data={data}
            listItem={RadioListItem}
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

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseAccountSelectPage);
