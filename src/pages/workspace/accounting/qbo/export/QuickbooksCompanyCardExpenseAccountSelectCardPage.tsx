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
import type {QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

type AccountListItem = ListItem & {
    value: QBONonReimbursableExportAccountType;
};

function QuickbooksCompanyCardExpenseAccountSelectCardPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {nonReimbursableExpensesExportDestination, syncLocations} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    const sections = useMemo(() => {
        const options: AccountListItem[] = [
            {
                text: translate(`workspace.qbo.accounts.credit_card`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD === nonReimbursableExpensesExportDestination,
            },
            {
                text: translate(`workspace.qbo.accounts.debit_card`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD === nonReimbursableExpensesExportDestination,
            },
        ];
        if (!isLocationEnabled) {
            options.push({
                text: translate(`workspace.qbo.accounts.bill`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL === nonReimbursableExpensesExportDestination,
            });
        }
        return [{data: options}];
    }, [translate, nonReimbursableExpensesExportDestination, isLocationEnabled]);

    const selectExportCompanyCard = useCallback(
        (row: AccountListItem) => {
            if (row.value !== nonReimbursableExpensesExportDestination) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
        },
        [nonReimbursableExpensesExportDestination, policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper testID={QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName}>
                <HeaderWithBackButton title={translate('workspace.qbo.exportCompany')} />
                <View style={styles.flex1}>
                    <SelectionList
                        containerStyle={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>}
                        sections={sections}
                        ListItem={RadioListItem}
                        onSelectRow={selectExportCompanyCard}
                        initiallyFocusedOptionKey={sections[0].data.find((option) => option.isSelected)?.keyForList}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectCardPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountSelectCardPage);
