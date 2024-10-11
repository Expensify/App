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
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account, QBDNonReimbursableExportAccountType} from '@src/types/onyx/Policy';

type MenuItem = ListItem & {
    value: QBDNonReimbursableExportAccountType;
    accounts: Account[];
    defaultVendor: string;
};

function QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {creditCardAccounts, payableAccounts, vendors, journalEntryAccounts} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const {canUseNewDotQBD} = usePermissions();

    const sections = useMemo(() => {
        const options: MenuItem[] = [
            {
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}`),
                value: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                keyForList: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                isSelected: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD === qbdConfig?.export.nonReimbursable,
                accounts: creditCardAccounts ?? [],
                defaultVendor: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
            {
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.JOURNAL_ENTRY}`),
                value: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.JOURNAL_ENTRY,
                keyForList: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isSelected: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.JOURNAL_ENTRY === qbdConfig?.export.nonReimbursable,
                accounts: journalEntryAccounts ?? [],
                defaultVendor: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
            {
                text: translate(`workspace.qbd.accounts.${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL}`),
                value: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                keyForList: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL === qbdConfig?.export.nonReimbursable,
                accounts: payableAccounts ?? [],
                defaultVendor: vendors?.[0]?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
        ];
        return [{data: options}];
    }, [translate, qbdConfig?.export.nonReimbursable, creditCardAccounts, journalEntryAccounts, payableAccounts, vendors]);

    const selectExportCompanyCard = useCallback(
        (row: MenuItem) => {
            if (row.value !== qbdConfig?.export.nonReimbursable) {
                QuickbooksDesktop.updateQuickbooksCompanyCardExpenseAccount(
                    policyID,
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE]: row.value,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT]: row.accounts.at(0)?.id ?? '',
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: row.defaultVendor,
                    },
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE]: qbdConfig?.export.nonReimbursable,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT]: qbdConfig?.export.nonReimbursableAccount,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: qbdConfig?.export.nonReimbursableBillDefaultVendor,
                    },
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [qbdConfig?.export.nonReimbursable, qbdConfig?.export.nonReimbursableAccount, qbdConfig?.export.nonReimbursableBillDefaultVendor, policyID],
    );
    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage.displayName}
            title="workspace.accounting.exportAs"
            sections={sections}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportCompanyCard(selection as MenuItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={sections.at(0)?.data.find((mode) => mode.isSelected)?.keyForList}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID))}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE], qbdConfig?.pendingFields)}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE)}
        />
    );
}

QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage';

export default withPolicyConnections(QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage);
