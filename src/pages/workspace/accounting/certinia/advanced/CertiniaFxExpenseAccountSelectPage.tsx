import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField, updateFinancialForceFxExpenseAccount} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type ExpenseAccountListItem = ListItem & {
    value: string;
};

function CertiniaFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const policyID = policy?.id;
    const {config, data} = policy?.connections?.financialforce ?? {};
    const expenseAccounts = data?.expenseAccounts ?? [];
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_FX_EXPENSE_ACCOUNT.path);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const dataOptions: ExpenseAccountListItem[] = expenseAccounts.map((account) => ({
        value: account.id,
        text: account.name,
        keyForList: account.id,
        isSelected: config?.fxExpenseAccount === account.id,
    }));

    // A Certinia chart of accounts runs to hundreds of General Ledger Accounts, so the list needs a search box.
    const {filteredData, textInputOptions} = useSelectionListSearch(dataOptions);

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.certinia.fxExpenseAccountDescription')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.certinia.noExpenseAccountsFound')}
            subtitle={translate('workspace.certinia.noExpenseAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectAccount = (row: ExpenseAccountListItem) => {
        if (row.value !== config?.fxExpenseAccount && policyID) {
            updateFinancialForceFxExpenseAccount(policyID, row.value, config?.fxExpenseAccount ?? null);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!canConfigureCurrencyConversionFees}
            displayName="CertiniaFxExpenseAccountSelectPage"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={listHeaderComponent}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={config?.fxExpenseAccount}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.certinia.fxExpenseAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(CertiniaFxExpenseAccountSelectPage);
