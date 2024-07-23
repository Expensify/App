import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {SectionListData} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, Section} from '@components/SelectionList/types';
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
import type {Account, QBOReimbursableExportAccountType} from '@src/types/onyx/Policy';

function Footer({isTaxEnabled, isLocationsEnabled}: {isTaxEnabled: boolean; isLocationsEnabled: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!isTaxEnabled && !isLocationsEnabled) {
        return null;
    }

    return (
        <View style={[styles.gap2, styles.mt2]}>
            {isTaxEnabled && <Text style={styles.mutedNormalTextLabel}>{translate('workspace.qbo.outOfPocketTaxEnabledDescription')}</Text>}
            {isLocationsEnabled && <Text style={styles.mutedNormalTextLabel}>{translate('workspace.qbo.outOfPocketLocationEnabledDescription')}</Text>}
        </View>
    );
}

type CardListItem = ListItem & {
    value: QBOReimbursableExportAccountType;
    isShown: boolean;
    accounts: Account[];
};
type CardsSection = SectionListData<CardListItem, Section<CardListItem>>;

function QuickbooksOutOfPocketExpenseEntitySelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {reimbursableExpensesExportDestination, reimbursableExpensesAccount, syncTax, syncLocations} = policy?.connections?.quickbooksOnline?.config ?? {};
    const {bankAccounts, accountPayable, journalEntryAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const isLocationsEnabled = !!(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = !!syncTax;
    const policyID = policy?.id ?? '-1';

    const data: CardListItem[] = useMemo(
        () => [
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                text: translate(`workspace.qbo.accounts.check`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isSelected: reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isShown: !isLocationsEnabled,
                accounts: bankAccounts ?? [],
            },
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                text: translate(`workspace.qbo.accounts.journal_entry`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isSelected: reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isShown: !isTaxesEnabled,
                accounts: journalEntryAccounts ?? [],
            },
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                text: translate(`workspace.qbo.accounts.bill`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isShown: !isLocationsEnabled,
                accounts: accountPayable ?? [],
            },
        ],
        [reimbursableExpensesExportDestination, isTaxesEnabled, translate, isLocationsEnabled, bankAccounts, accountPayable, journalEntryAccounts],
    );

    const sections: CardsSection[] = useMemo(() => [{data: data.filter((item) => item.isShown)}], [data]);

    const selectExportEntity = useCallback(
        (row: CardListItem) => {
            if (row.value !== reimbursableExpensesExportDestination) {
                Connections.updateManyPolicyConnectionConfigs(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBO,
                    {
                        [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: row.value,
                        [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: row.accounts[0],
                    },
                    {
                        [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: reimbursableExpensesExportDestination,
                        [CONST.QUICK_BOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: reimbursableExpensesAccount,
                    },
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [reimbursableExpensesExportDestination, policyID, reimbursableExpensesAccount],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={QuickbooksOutOfPocketExpenseEntitySelectPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.exportAs')} />
                <View style={styles.flex1}>
                    <SelectionList
                        containerStyle={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        sections={sections}
                        ListItem={RadioListItem}
                        onSelectRow={selectExportEntity}
                        shouldDebounceRowSelect
                        initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                        footerContent={
                            <Footer
                                isTaxEnabled={isTaxesEnabled}
                                isLocationsEnabled={isLocationsEnabled}
                            />
                        }
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksOutOfPocketExpenseEntitySelectPage';

export default withPolicyConnections(QuickbooksOutOfPocketExpenseEntitySelectPage);
