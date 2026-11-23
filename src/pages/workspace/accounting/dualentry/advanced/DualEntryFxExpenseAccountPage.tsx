import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntryFxExpenseAccount} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import FxExpenseAccountSelectPage from '@pages/workspace/accounting/common/FxExpenseAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function DualEntryFxExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const fxExpenseAccountID = dualentryConfig?.sync?.fxExpenseAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute(policyID) : undefined;

    // The cost is booked against the bill payment, which only exists while reimbursed reports are synced
    const syncReimbursedReports = dualentryConfig?.sync?.syncReimbursedReports ?? true;

    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(fxExpenseAccountID);
    const expenseAccounts = dualentryData?.accounts?.filter((accountItem) => accountItem.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.EXPENSE && accountItem.isActive) ?? [];
    const expenseAccountOptions: SelectorType[] = expenseAccounts.map((accountItem) => ({
        value: accountItem.id,
        text: `${accountItem.id} ${accountItem.name}`,
        keyForList: accountItem.id,
        isSelected: selectedAccountID === accountItem.id,
    }));

    const saveSelectedAccount = () => {
        if (hasChanges && policyID) {
            updateDualEntryFxExpenseAccount(policyID, selectedAccountID, fxExpenseAccountID);
        }
        Navigation.goBack(backPath);
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(expenseAccountOptions, saveSelectedAccount);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.dualEntry.fxExpenseAccount.description')}</Text>
        </View>
    );

    return (
        <FxExpenseAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            shouldBeBlocked={!syncReimbursedReports || !canConfigureCurrencyConversionFees}
            displayName="DualEntryFxExpenseAccountPage"
            title="workspace.dualEntry.fxExpenseAccount.label"
            data={searchableList}
            emptyStateTitle={translate('workspace.dualEntry.noAccountsFound')}
            emptyStateSubtitle={translate('workspace.dualEntry.noAccountsFoundDescription')}
            onSelectRow={selectAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.FX_EXPENSE_ACCOUNT_ID], dualentryConfig?.pendingFields)}
            errors={getLatestErrorField(dualentryConfig, CONST.DUALENTRY_CONFIG.FX_EXPENSE_ACCOUNT_ID)}
            onClose={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.FX_EXPENSE_ACCOUNT_ID)}
            confirmButtonOptions={confirmButtonOptions}
        >
            {headerContent}
        </FxExpenseAccountSelectPage>
    );
}

export default withPolicyConnections(DualEntryFxExpenseAccountPage);
