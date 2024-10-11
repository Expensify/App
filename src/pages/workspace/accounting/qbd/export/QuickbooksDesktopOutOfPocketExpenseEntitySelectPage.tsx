import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
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
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
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
    const policyID = policy?.id ?? '-1';
    const {canUseNewDotQBD} = usePermissions();

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

    const sections = useMemo(() => [{data: data.filter((item) => item.isShown)}], [data]);

    const selectExportEntity = useCallback(
        (row: MenuItem) => {
            if (row.value !== reimbursable) {
                QuickbooksDesktop.updateQuickbooksDesktopExpensesExportDestination(
                    policyID,
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE]: row.value,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT]: row.accounts.at(0)?.id ?? '',
                    },
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE]: reimbursable ?? CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT]: qbdConfig?.export?.reimbursableAccount ?? '',
                    },
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [reimbursable, policyID, qbdConfig?.export?.reimbursableAccount],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopOutOfPocketExpenseEntitySelectPage.displayName}
            sections={sections}
            listItem={RadioListItem}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID))}
            onSelectRow={(selection: SelectorType) => selectExportEntity(selection as MenuItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.accounting.exportAs"
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={
                hasErrors && reimbursable
                    ? {
                          [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE]: translate(`workspace.qbd.accounts.${reimbursable}Error`),
                      }
                    : ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE)
            }
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE)}
        />
    );
}

QuickbooksDesktopOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseEntitySelectPage';

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseEntitySelectPage);
