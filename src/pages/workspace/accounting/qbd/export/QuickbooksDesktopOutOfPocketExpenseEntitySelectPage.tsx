import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account, QBDReimbursableExportAccountType} from '@src/types/onyx/Policy';

function Footer({isTaxEnabled, isLocationsEnabled}: {isTaxEnabled: boolean; isLocationsEnabled: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!isTaxEnabled && !isLocationsEnabled) {
        return null;
    }

    return (
        <View style={[styles.gap2, styles.mt2, styles.ph5]}>
            {isTaxEnabled && <Text style={styles.mutedNormalTextLabel}>{translate('workspace.qbo.outOfPocketTaxEnabledDescription')}</Text>}
            {isLocationsEnabled && <Text style={styles.mutedNormalTextLabel}>{translate('workspace.qbo.outOfPocketLocationEnabledDescription')}</Text>}
        </View>
    );
}
type MenuItem = ListItem & {
    value: QBDReimbursableExportAccountType;
    isShown: boolean;
    accounts: Account[];
};
function QuickbooksDesktopOutOfPocketExpenseEntitySelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const qbdConfig = policy?.connections?.quickbooksOnline?.config; // TODO: should be updated to use the new connections object
    const {bankAccounts, accountPayable, journalEntryAccounts} = policy?.connections?.quickbooksOnline?.data ?? {}; // TODO: should be updated to use the new connections object
    const isLocationsEnabled = !!(qbdConfig?.syncLocations && qbdConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = !!qbdConfig?.syncTax;
    const shouldShowTaxError = isTaxesEnabled && qbdConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    const shouldShowLocationError = isLocationsEnabled && qbdConfig?.reimbursableExpensesExportDestination !== CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    const hasErrors = !!qbdConfig?.errorFields?.reimbursableExpensesExportDestination && (shouldShowTaxError || shouldShowLocationError);
    const policyID = policy?.id ?? '-1';
    const {canUseNewDotQBD} = usePermissions();

    const data: MenuItem[] = useMemo(
        () => [
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                text: translate(`workspace.qbo.accounts.check`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isSelected: qbdConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isShown: !isLocationsEnabled,
                accounts: bankAccounts ?? [],
            },
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                text: translate(`workspace.qbo.accounts.journal_entry`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isSelected: qbdConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isShown: !isTaxesEnabled,
                accounts: journalEntryAccounts ?? [],
            },
            {
                value: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                text: translate(`workspace.qbo.accounts.bill`),
                keyForList: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: qbdConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isShown: !isLocationsEnabled,
                accounts: accountPayable ?? [],
            },
        ],
        [qbdConfig?.reimbursableExpensesExportDestination, isTaxesEnabled, translate, isLocationsEnabled, bankAccounts, accountPayable, journalEntryAccounts],
    );

    const sections = useMemo(() => [{data: data.filter((item) => item.isShown)}], [data]);

    const selectExportEntity = useCallback(
        (row: MenuItem) => {
            if (row.value !== qbdConfig?.reimbursableExpensesExportDestination) {
                Connections.updateManyPolicyConnectionConfigs(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBD,
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: row.value,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: row.accounts.at(0),
                    },
                    {
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: qbdConfig?.reimbursableExpensesExportDestination,
                        [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT]: qbdConfig?.reimbursableExpensesAccount,
                    },
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [qbdConfig?.reimbursableExpensesExportDestination, policyID, qbdConfig?.reimbursableExpensesAccount],
    );

    const accessVariants = canUseNewDotQBD ? [] : [CONST.POLICY.ACCESS_VARIANTS.ADMIN];

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={accessVariants}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopOutOfPocketExpenseEntitySelectPage.displayName}
            sections={sections}
            listItem={RadioListItem}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID))}
            onSelectRow={(selection: SelectorType) => selectExportEntity(selection as MenuItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.accounting.exportAs"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={PolicyUtils.settingsPendingAction(
                [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT],
                qbdConfig?.pendingFields,
            )}
            errors={
                hasErrors && qbdConfig?.reimbursableExpensesExportDestination
                    ? {
                          [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: translate(
                              `workspace.qbo.accounts.${qbdConfig?.reimbursableExpensesExportDestination}Error`,
                          ),
                      }
                    : ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION)
            }
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION)}
            listFooterContent={
                <Footer
                    isTaxEnabled={isTaxesEnabled}
                    isLocationsEnabled={isLocationsEnabled}
                />
            }
        />
    );
}

QuickbooksDesktopOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseEntitySelectPage';

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseEntitySelectPage);
