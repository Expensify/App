import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateManyPolicyConnectionConfigs} from '@libs/actions/connections';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Account, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

type MenuItem = ListItem & {
    value: QBONonReimbursableExportAccountType;
    accounts: Account[];
    defaultVendor: string;
};

function QuickbooksCompanyCardExpenseAccountSelectCardPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {creditCards, bankAccounts, accountPayable, vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const isLocationEnabled = !!(qboConfig?.syncLocations && qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT>>();
    const backTo = route.params?.backTo;

    const data: MenuItem[] = useMemo(() => {
        const options: MenuItem[] = [
            {
                text: translate(`workspace.qbo.accounts.credit_card`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD === qboConfig?.nonReimbursableExpensesExportDestination,
                accounts: creditCards ?? [],
                defaultVendor: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
            {
                text: translate(`workspace.qbo.accounts.debit_card`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD === qboConfig?.nonReimbursableExpensesExportDestination,
                accounts: bankAccounts ?? [],
                defaultVendor: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
        ];
        if (!isLocationEnabled) {
            options.push({
                text: translate(`workspace.qbo.accounts.bill`),
                value: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                keyForList: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL === qboConfig?.nonReimbursableExpensesExportDestination,
                accounts: accountPayable ?? [],
                defaultVendor: vendors?.[0]?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            });
        }
        return options;
    }, [translate, qboConfig?.nonReimbursableExpensesExportDestination, isLocationEnabled, accountPayable, bankAccounts, creditCards, vendors]);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)));
    }, [backTo, policyID]);

    const selectExportCompanyCard = useCallback(
        (row: MenuItem) => {
            if (row.value !== qboConfig?.nonReimbursableExpensesExportDestination) {
                updateManyPolicyConnectionConfigs(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBO,
                    {
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: row.value,
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT]: row.accounts.at(0),
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: row.defaultVendor,
                    },
                    {
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: qboConfig?.nonReimbursableExpensesExportDestination,
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT]: qboConfig?.nonReimbursableExpensesAccount,
                        [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: qboConfig?.nonReimbursableBillDefaultVendor,
                    },
                );
            }
            goBack();
        },
        [qboConfig?.nonReimbursableExpensesExportDestination, policyID, qboConfig?.nonReimbursableExpensesAccount, qboConfig?.nonReimbursableBillDefaultVendor, goBack],
    );
    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksCompanyCardExpenseAccountSelectCardPage"
            title="workspace.accounting.exportAs"
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportCompanyCard(selection as MenuItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={goBack}
            listFooterContent={
                isLocationEnabled ? <Text style={[styles.mutedNormalTextLabel, styles.ph5, styles.pv3]}>{translate('workspace.qbo.companyCardsLocationEnabledDescription')}</Text> : undefined
            }
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION], qboConfig?.pendingFields)}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION)}
        />
    );
}

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountSelectCardPage);
