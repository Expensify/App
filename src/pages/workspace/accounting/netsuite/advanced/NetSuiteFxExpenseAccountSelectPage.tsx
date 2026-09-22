import BlockingView from '@components/BlockingViews/BlockingView';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateNetSuiteFxExpenseAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteExpenseAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';

import {shouldHideReimbursedReportsSection} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

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
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const config = policy?.connections?.netsuite?.options.config;
    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(config?.fxExpenseAccount);
    const netsuiteFxExpenseAccountOptions = getNetSuiteExpenseAccountOptions(policy ?? undefined, selectedAccountID);
    const {filteredData: filteredAccounts, textInputOptions} = useSelectionListSearch(netsuiteFxExpenseAccountOptions);

    const saveSelectedAccount = () => {
        if (hasChanges && policyID) {
            updateNetSuiteFxExpenseAccount(policyID, selectedAccountID, config?.fxExpenseAccount);
        }
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
    };

    const {listData, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(filteredAccounts, netsuiteFxExpenseAccountOptions.length, saveSelectedAccount);

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.netsuite.noAccountsFound')}
            subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.fxExpenseAccountDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteFxExpenseAccountSelectPage"
            headerContent={headerContent}
            data={listData}
            textInputOptions={textInputOptions}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.fxExpenseAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={shouldHideReimbursedReportsSection(config) || !canConfigureCurrencyConversionFees}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        />
    );
}

export default withPolicyConnections(NetSuiteFxExpenseAccountSelectPage);
