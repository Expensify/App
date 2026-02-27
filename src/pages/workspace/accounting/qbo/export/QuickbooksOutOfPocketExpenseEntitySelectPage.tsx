import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
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
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {Account, QBOReimbursableExportAccountType} from '@src/types/onyx/Policy';

function Footer({isTaxEnabled}: {isTaxEnabled: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!isTaxEnabled) {
        return null;
    }

    return (
        <View style={[styles.gap2, styles.mt2, styles.ph5]}>
            {isTaxEnabled && <Text style={styles.mutedNormalTextLabel}>{translate('workspace.qbo.outOfPocketTaxEnabledDescription')}</Text>}
        </View>
    );
}
type MenuItem = ListItem & {
    value: QBOReimbursableExportAccountType;
    isShown: boolean;
    accounts: Account[];
};
function QuickbooksOutOfPocketExpenseEntitySelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {bankAccounts, accountPayable, journalEntryAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const isTaxesEnabled = !!qboConfig?.syncTax;
    const shouldShowTaxError = isTaxesEnabled && qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    const hasErrors = !!qboConfig?.errorFields?.reimbursableExpensesExportDestination && shouldShowTaxError;
    const policyID = policy?.id;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT>>();
    const backTo = route.params?.backTo;
    const [selectedExportDestinationError, setSelectedExportDestinationError] = useState<Errors | null>(null);

    const data: MenuItem[] = useMemo(
        () => [
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                text: translate(`workspace.qbo.accounts.check`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isSelected: qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isShown: qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                accounts: bankAccounts ?? [],
            },
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                text: translate(`workspace.qbo.accounts.journal_entry`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isSelected: qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isShown: !isTaxesEnabled,
                accounts: journalEntryAccounts ?? [],
            },
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                text: translate(`workspace.qbo.accounts.bill`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isShown: qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                accounts: accountPayable ?? [],
            },
        ],
        [qboConfig?.reimbursableExpensesExportDestination, qboConfig?.syncLocations, translate, bankAccounts, accountPayable, journalEntryAccounts, isTaxesEnabled],
    );

    const filteredData = useMemo(() => data.filter((item) => item.isShown), [data]);
    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)));
    }, [policyID, backTo]);
    const selectExportEntity = useCallback(
        (row: MenuItem) => {
            if (!row.accounts.at(0)) {
                setSelectedExportDestinationError({
                    [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: translate(`workspace.qbo.exportDestinationSetupAccountsInfo.${row.value}`),
                });
                return;
            }

            if (row.value !== qboConfig?.reimbursableExpensesExportDestination) {
                setSelectedExportDestinationError(null);
                updateManyPolicyConnectionConfigs(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBO,
                    {
                        [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: row.value,
                        [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: row.accounts.at(0),
                    },
                    {
                        [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: qboConfig?.reimbursableExpensesExportDestination,
                        [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: qboConfig?.reimbursableExpensesAccount,
                    },
                );
            }
            goBack();
        },
        [qboConfig?.reimbursableExpensesExportDestination, policyID, qboConfig?.reimbursableExpensesAccount, goBack, translate],
    );

    const errors =
        hasErrors && qboConfig?.reimbursableExpensesExportDestination
            ? {[CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: translate(`workspace.qbo.accounts.${qboConfig?.reimbursableExpensesExportDestination}Error`)}
            : getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION);

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksOutOfPocketExpenseEntitySelectPage"
            data={filteredData}
            listItem={RadioListItem}
            onBackButtonPress={goBack}
            onSelectRow={(selection: SelectorType) => selectExportEntity(selection as MenuItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.accounting.exportAs"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            pendingAction={settingsPendingAction(
                [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT],
                qboConfig?.pendingFields,
            )}
            errors={selectedExportDestinationError ?? errors}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => {
                setSelectedExportDestinationError(null);
                clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION);
            }}
            listFooterContent={<Footer isTaxEnabled={isTaxesEnabled} />}
        />
    );
}

export default withPolicyConnections(QuickbooksOutOfPocketExpenseEntitySelectPage);
