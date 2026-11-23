import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletFxExpenseAccount} from '@libs/actions/connections/Rillet';
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

function RilletFxExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const fxExpenseAccountCode = rilletConfig?.sync?.fxExpenseAccountCode;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_ADVANCED.getRoute(policyID) : undefined;

    // The cost is booked against the bill payment, which only exists while reimbursed reports are synced
    const syncReimbursedReports = rilletConfig?.sync?.syncReimbursedReports ?? true;

    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(fxExpenseAccountCode);
    const expenseAccounts =
        rilletData?.accounts?.filter((accountItem) => accountItem.type === CONST.RILLET_ACCOUNT_TYPE.EXPENSE && accountItem.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE) ?? [];
    const expenseAccountOptions: SelectorType[] = expenseAccounts.map((accountItem) => ({
        value: accountItem.code,
        text: `${accountItem.code} ${accountItem.name}`,
        keyForList: accountItem.code,
        isSelected: selectedAccountID === accountItem.code,
    }));

    const saveSelectedAccount = () => {
        if (hasChanges && policyID) {
            updateRilletFxExpenseAccount(policyID, selectedAccountID, fxExpenseAccountCode);
        }
        Navigation.goBack(backPath);
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(expenseAccountOptions, saveSelectedAccount);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.fxExpenseAccount.description')}</Text>
        </View>
    );

    return (
        <FxExpenseAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            shouldBeBlocked={!syncReimbursedReports || !canConfigureCurrencyConversionFees}
            displayName="RilletFxExpenseAccountPage"
            title="workspace.rillet.fxExpenseAccount.label"
            data={searchableList}
            emptyStateTitle={translate('workspace.rillet.noAccountsFound')}
            emptyStateSubtitle={translate('workspace.rillet.noAccountsFoundDescription')}
            onSelectRow={selectAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE)}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE)}
            confirmButtonOptions={confirmButtonOptions}
        >
            {headerContent}
        </FxExpenseAccountSelectPage>
    );
}

export default withPolicyConnections(RilletFxExpenseAccountPage);
