import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksDesktopFxExpenseAccount} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearQBDErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function DynamicQuickbooksDesktopFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const expenseAccounts = policy?.connections?.quickbooksDesktop?.data?.expenseAccounts ?? [];
    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(qbdConfig?.fxExpenseAccount);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_FX_EXPENSE_ACCOUNT_SELECT.path);

    const accountOptions: SelectorType[] = expenseAccounts.map((account) => ({
        value: account.id,
        text: account.name,
        keyForList: account.id,
        isSelected: selectedAccountID === account.id,
    }));

    const saveSelectedAccount = () => {
        if (hasChanges) {
            updateQuickbooksDesktopFxExpenseAccount(policyID, selectedAccountID, qbdConfig?.fxExpenseAccount);
        }
        Navigation.goBack(backPath);
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(accountOptions, expenseAccounts.length, saveSelectedAccount);
    const {filteredData: listData, textInputOptions} = useSelectionListSearch(searchableList, translate('common.noResultsFound'));

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbd.advancedConfig.fxExpenseAccountDescription')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.qbd.noAccountsFound')}
            subtitle={translate('workspace.qbd.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!canConfigureCurrencyConversionFees}
            displayName="DynamicQuickbooksDesktopFxExpenseAccountSelectPage"
            data={listData}
            textInputOptions={textInputOptions}
            headerContent={listHeaderComponent}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.qbd.advancedConfig.fxExpenseAccount"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT)}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            confirmButtonOptions={confirmButtonOptions}
        />
    );
}

export default withPolicyConnections(DynamicQuickbooksDesktopFxExpenseAccountSelectPage);
