import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

type MenuItem = ListItem & {
    value: QBONonReimbursableExportAccountType;
    accounts: Account[];
    defaultVendor: string;
};

function QuickbooksCompanyCardExpenseAccountSelectCardPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {nonReimbursableExpensesExportDestination, nonReimbursableExpensesAccount, syncLocations, nonReimbursableBillDefaultVendor} = policy?.connections?.quickbooksOnline?.config ?? {};
    const {creditCards, bankAccounts, accountPayable, vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const isLocationEnabled = !!(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    const sections = useMemo(() => {
        const options: MenuItem[] = [
            {
                text: translate(`workspace.qbo.accounts.credit_card`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD === nonReimbursableExpensesExportDestination,
                accounts: creditCards ?? [],
                defaultVendor: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
            {
                text: translate(`workspace.qbo.accounts.debit_card`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD === nonReimbursableExpensesExportDestination,
                accounts: bankAccounts ?? [],
                defaultVendor: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
        ];
        if (!isLocationEnabled) {
            options.push({
                text: translate(`workspace.qbo.accounts.bill`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL === nonReimbursableExpensesExportDestination,
                accounts: accountPayable ?? [],
                defaultVendor: vendors?.[0]?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            });
        }
        return [{data: options}];
    }, [translate, nonReimbursableExpensesExportDestination, isLocationEnabled, accountPayable, bankAccounts, creditCards, vendors]);

    const selectExportCompanyCard = useCallback(
        (row: MenuItem) => {
            if (row.value !== nonReimbursableExpensesExportDestination) {
                Connections.updateManyPolicyConnectionConfigs(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBO,
                    {
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: row.value,
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT]: row.accounts[0],
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: row.defaultVendor,
                    },
                    {
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: nonReimbursableExpensesExportDestination,
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT]: nonReimbursableExpensesAccount,
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: nonReimbursableBillDefaultVendor,
                    },
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableExpensesExportDestination, policyID, nonReimbursableExpensesAccount, nonReimbursableBillDefaultVendor],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName}
            title="workspace.accounting.exportAs"
            sections={sections}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportCompanyCard(selection as MenuItem)}
            shouldDebounceRowSelect
            initiallyFocusedOptionKey={sections[0]?.data.find((mode) => mode.isSelected)?.keyForList}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack()}
            listFooterContent={
                isLocationEnabled ? <Text style={[styles.mutedNormalTextLabel, styles.pt2]}>{translate('workspace.qbo.companyCardsLocationEnabledDescription')}</Text> : undefined
            }
        />
    );
}

QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectCardPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountSelectCardPage);
