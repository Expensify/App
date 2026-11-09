import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksOnlineFxExpenseAccount} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import FxExpenseAccountSelectPage from '@pages/workspace/accounting/common/FxExpenseAccountSelectPage';
import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function QuickbooksFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);

    const policyID = policy?.id;
    const {expenseAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(qboConfig?.fxExpenseAccount);

    const qboOnlineSelectorOptions: SelectorType[] = (expenseAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedAccountID === id,
    }));
    const saveSelectedAccount = () => {
        if (hasChanges) {
            updateQuickbooksOnlineFxExpenseAccount(policyID, selectedAccountID, qboConfig?.fxExpenseAccount);
        }
        Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(qboOnlineSelectorOptions, saveSelectedAccount);

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.fxExpenseAccountDescription', integrationName)}</Text>
        </View>
    );

    return (
        <FxExpenseAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={!canConfigureCurrencyConversionFees}
            displayName="QuickbooksFxExpenseAccountSelectPage"
            data={searchableList}
            onSelectRow={selectAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            emptyStateTitle={translate('workspace.qbo.noAccountsFound')}
            emptyStateSubtitle={translate('workspace.qbo.noAccountsFoundDescription', integrationName)}
            title="workspace.qbo.advancedConfig.qboFxExpenseAccount"
            headerTitleAlreadyTranslated={translate('workspace.qbo.advancedConfig.qboFxExpenseAccount', integrationName)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID))}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.mv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        >
            {listHeaderComponent}
        </FxExpenseAccountSelectPage>
    );
}

export default withPolicyConnections(QuickbooksFxExpenseAccountSelectPage);
