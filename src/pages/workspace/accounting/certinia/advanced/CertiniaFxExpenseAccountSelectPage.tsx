import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField, updateFinancialForceFxExpenseAccount} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import {isCertiniaFFAConnection} from '@pages/workspace/accounting/certinia/utils';
import FxExpenseAccountSelectPage from '@pages/workspace/accounting/common/FxExpenseAccountSelectPage';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function CertiniaFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const policyID = policy?.id;
    const {config, data} = policy?.connections?.financialforce ?? {};
    const expenseAccounts = data?.expenseAccounts ?? [];
    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(config?.fxExpenseAccount);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_FX_EXPENSE_ACCOUNT.path);

    const accountOptions: SelectorType[] = expenseAccounts.map((account) => ({
        value: account.id,
        text: account.name,
        keyForList: account.id,
        isSelected: selectedAccountID === account.id,
    }));

    const saveSelectedAccount = () => {
        if (hasChanges && policyID) {
            updateFinancialForceFxExpenseAccount(policyID, selectedAccountID, config?.fxExpenseAccount ?? null);
        }
        Navigation.goBack(backPath);
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(accountOptions, saveSelectedAccount);

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.certinia.fxExpenseAccountDescription')}</Text>
        </View>
    );

    return (
        <FxExpenseAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={!isCertiniaFFAConnection(config) || !canConfigureCurrencyConversionFees}
            displayName="CertiniaFxExpenseAccountSelectPage"
            data={searchableList}
            onSelectRow={selectAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.certinia.fxExpenseAccount"
            emptyStateTitle={translate('workspace.certinia.noExpenseAccountsFound')}
            emptyStateSubtitle={translate('workspace.certinia.noExpenseAccountsFoundDescription')}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT)}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        >
            {listHeaderComponent}
        </FxExpenseAccountSelectPage>
    );
}

export default withPolicyConnections(CertiniaFxExpenseAccountSelectPage);
