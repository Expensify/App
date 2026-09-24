import BlockingView from '@components/BlockingViews/BlockingView';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getXeroExpenseAccounts, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

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
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
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

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(xeroSelectorOptions, expenseAccounts.length, saveSelectedAccount);
    const {filteredData: listData, textInputOptions} = useSelectionListSearch(searchableList, translate('common.noResultsFound'));

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.advancedConfig.fxExpenseAccountDescription')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.xero.noAccountsFound')}
            subtitle={translate('workspace.xero.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="XeroFxExpenseAccountSelectorPage"
            data={listData}
            textInputOptions={textInputOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            shouldBeBlocked={!syncReimbursedReports || !canConfigureCurrencyConversionFees}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID))}
            title="workspace.xero.advancedConfig.xeroFxExpenseAccount"
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        />
    );
}

export default withPolicyConnections(XeroFxExpenseAccountSelectorPage);
