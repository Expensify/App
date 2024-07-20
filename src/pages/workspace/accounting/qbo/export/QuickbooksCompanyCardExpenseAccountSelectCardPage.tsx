import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

type AccountListItem = ListItem & {
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
        const options: AccountListItem[] = [
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
        (row: AccountListItem) => {
            if (row.value !== nonReimbursableExpensesExportDestination) {
                Connections.updateManyPolicyConnectionConfigs(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBO,
                    {
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: row.value,
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT]: row.accounts[0],
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: row.defaultVendor,
                    },
                    {
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: nonReimbursableExpensesExportDestination,
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT]: nonReimbursableExpensesAccount,
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: nonReimbursableBillDefaultVendor,
                    },
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableExpensesExportDestination, policyID, nonReimbursableExpensesAccount, nonReimbursableBillDefaultVendor],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.accounting.exportAs')} />
                <View style={styles.flex1}>
                    <SelectionList
                        containerStyle={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        sections={sections}
                        ListItem={RadioListItem}
                        onSelectRow={selectExportCompanyCard}
                        shouldDebounceRowSelect
                        initiallyFocusedOptionKey={sections[0].data.find((option) => option.isSelected)?.keyForList}
                        footerContent={
                            isLocationEnabled && <Text style={[styles.mutedNormalTextLabel, styles.pt2]}>{translate('workspace.qbo.companyCardsLocationEnabledDescription')}</Text>
                        }
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectCardPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountSelectCardPage);
