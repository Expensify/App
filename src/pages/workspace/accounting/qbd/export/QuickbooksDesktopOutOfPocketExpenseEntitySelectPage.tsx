import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopExpensesExportDestination} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Account, QBDReimbursableExportAccountType} from '@src/types/onyx/Policy';

type MenuItem = ListItem & {
    value: QBDReimbursableExportAccountType;
    isShown: boolean;
    accounts: Account[];
};
function QuickbooksDesktopOutOfPocketExpenseEntitySelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const reimbursable = qbdConfig?.export.reimbursable;
    const hasErrors = !!qbdConfig?.errorFields?.reimbursable;
    const policyID = policy?.id;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT>>();
    const backTo = route.params?.backTo;

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)));
    }, [policyID, backTo]);

    const data: MenuItem[] = useMemo(
        () => [
            {
                value: CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}`),
                keyForList: CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isSelected: reimbursable === CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isShown: true,
                accounts: getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop, CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK),
            },
            {
                value: CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}`),
                keyForList: CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isSelected: reimbursable === CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isShown: true,
                accounts: getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop, CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY),
            },
            {
                value: CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}`),
                keyForList: CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: reimbursable === CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isShown: true,
                accounts: getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop, CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL),
            },
        ],
        [translate, reimbursable, policy?.connections?.quickbooksDesktop],
    );

    const filteredData = useMemo(() => data.filter((item) => item.isShown), [data]);

    const selectExportEntity = useCallback(
        (row: MenuItem) => {
            const account = row?.accounts?.at(0)?.id;
            if (row.value !== reimbursable && policyID) {
                updateQuickbooksDesktopExpensesExportDestination(
                    policyID,
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE]: row.value,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT]: account,
                    },
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE]: reimbursable,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT]: qbdConfig?.export?.reimbursableAccount,
                    },
                );
            }
            goBack();
        },
        [reimbursable, policyID, qbdConfig?.export?.reimbursableAccount, goBack],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksDesktopOutOfPocketExpenseEntitySelectPage"
            data={filteredData}
            listItem={RadioListItem}
            onBackButtonPress={goBack}
            onSelectRow={(selection: SelectorType) => selectExportEntity(selection as MenuItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.accounting.exportAs"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={
                hasErrors && reimbursable
                    ? {
                          [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE]: translate(`workspace.qbd.accounts.${reimbursable}Error`),
                      }
                    : getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE)
            }
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE)}
        />
    );
}

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseEntitySelectPage);
