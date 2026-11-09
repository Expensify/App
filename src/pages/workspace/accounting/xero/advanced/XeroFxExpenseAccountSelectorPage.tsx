import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getXeroExpenseAccounts, settingsPendingAction} from '@libs/PolicyUtils';

import FxExpenseAccountSelectPage from '@pages/workspace/accounting/common/FxExpenseAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {updateXeroFxExpenseAccount} from '@userActions/connections/Xero';
import {clearXeroErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function XeroFxExpenseAccountSelectorPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);

    const policyID = policy?.id;
    const {config, data} = policy?.connections?.xero ?? {};
    const {syncReimbursedReports} = config?.sync ?? {};
    const expenseAccounts = data?.expenseAccounts ?? [];
    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(config?.fxExpenseAccount);
    const xeroSelectorOptions = getXeroExpenseAccounts(expenseAccounts, selectedAccountID);

    const saveSelectedAccount = () => {
        if (hasChanges) {
            updateXeroFxExpenseAccount(policyID, selectedAccountID, config?.fxExpenseAccount);
        }
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(xeroSelectorOptions, saveSelectedAccount);

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.advancedConfig.fxExpenseAccountDescription')}</Text>
        </View>
    );

    return (
        <FxExpenseAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            displayName="XeroFxExpenseAccountSelectorPage"
            data={searchableList}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            shouldBeBlocked={!syncReimbursedReports || !canConfigureCurrencyConversionFees}
            onSelectRow={selectAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID))}
            title="workspace.xero.advancedConfig.xeroFxExpenseAccount"
            emptyStateTitle={translate('workspace.xero.noAccountsFound')}
            emptyStateSubtitle={translate('workspace.xero.noAccountsFoundDescription')}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT)}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        >
            {listHeaderComponent}
        </FxExpenseAccountSelectPage>
    );
}

export default withPolicyConnections(XeroFxExpenseAccountSelectorPage);
