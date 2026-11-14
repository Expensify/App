import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateNetSuiteFxExpenseAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteExpenseAccountOptions} from '@libs/NetSuiteUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import FxExpenseAccountSelectPage from '@pages/workspace/accounting/common/FxExpenseAccountSelectPage';
import {shouldHideReimbursedReportsSection} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function NetSuiteFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);

    const policyID = policy?.id;

    const config = policy?.connections?.netsuite?.options.config;
    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(config?.fxExpenseAccount);
    const netsuiteFxExpenseAccountOptions = getNetSuiteExpenseAccountOptions(policy ?? undefined, selectedAccountID);

    const saveSelectedAccount = () => {
        if (hasChanges && policyID) {
            updateNetSuiteFxExpenseAccount(policyID, selectedAccountID, config?.fxExpenseAccount);
        }
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(netsuiteFxExpenseAccountOptions, saveSelectedAccount);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.fxExpenseAccountDescription')}</Text>
        </View>
    );

    return (
        <FxExpenseAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            displayName="NetSuiteFxExpenseAccountSelectPage"
            data={searchableList}
            onSelectRow={selectAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.fxExpenseAccount"
            emptyStateTitle={translate('workspace.netsuite.noAccountsFound')}
            emptyStateSubtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={shouldHideReimbursedReportsSection(config) || !canConfigureCurrencyConversionFees}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT)}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        >
            {headerContent}
        </FxExpenseAccountSelectPage>
    );
}

export default withPolicyConnections(NetSuiteFxExpenseAccountSelectPage);
