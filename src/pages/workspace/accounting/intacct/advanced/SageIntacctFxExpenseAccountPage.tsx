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
import {getSageIntacctExpenseAccounts, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {updateSageIntacctFxExpenseAccount} from '@userActions/connections/SageIntacct';
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function SageIntacctFxExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);

    const policyID = policy?.id;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const {config} = policy?.connections?.intacct ?? {};
    const {syncReimbursedReports} = config?.sync ?? {};
    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(config?.fxExpenseAccount);
    const expenseAccountOptions = getSageIntacctExpenseAccounts(policy, selectedAccountID);

    const saveSelectedAccount = () => {
        if (hasChanges) {
            updateSageIntacctFxExpenseAccount(policyID, selectedAccountID, config?.fxExpenseAccount);
        }
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(expenseAccountOptions, expenseAccountOptions.length, saveSelectedAccount);
    const {filteredData: listData, textInputOptions} = useSelectionListSearch(searchableList, translate('common.noResultsFound'));

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.fxExpenseAccountDescription')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.sageIntacct.noAccountsFound')}
            subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctFxExpenseAccountPage"
            data={listData}
            textInputOptions={textInputOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            shouldBeBlocked={!syncReimbursedReports || !canConfigureCurrencyConversionFees}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID))}
            title="workspace.sageIntacct.fxExpenseAccount"
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        />
    );
}

export default withPolicyConnections(SageIntacctFxExpenseAccountPage);
