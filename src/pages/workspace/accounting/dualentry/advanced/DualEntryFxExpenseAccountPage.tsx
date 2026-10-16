import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntryFxExpenseAccount} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function DualEntryFxExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const fxExpenseAccountID = dualentryConfig?.sync?.fxExpenseAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute(policyID) : undefined;

    // The cost is booked against the bill payment, which only exists while reimbursed reports are synced
    const syncReimbursedReports = dualentryConfig?.sync?.syncReimbursedReports ?? true;

    const {selectedAccountID, hasChanges, selectAccount, buildList} = useFxExpenseAccountPicker(fxExpenseAccountID);
    const expenseAccounts = dualentryData?.accounts?.filter((accountItem) => accountItem.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.EXPENSE && accountItem.isActive) ?? [];
    const expenseAccountOptions: SelectorType[] = expenseAccounts.map((accountItem) => ({
        value: accountItem.id,
        text: `${accountItem.id} ${accountItem.name}`,
        keyForList: accountItem.id,
        isSelected: selectedAccountID === accountItem.id,
    }));

    const saveSelectedAccount = () => {
        if (hasChanges && policyID) {
            updateDualEntryFxExpenseAccount(policyID, selectedAccountID, fxExpenseAccountID);
        }
        Navigation.goBack(backPath);
    };

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(expenseAccountOptions, saveSelectedAccount);
    const {filteredData, textInputOptions} = useSelectionListSearch(searchableList, translate('common.noResultsFound'));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.dualEntry.fxExpenseAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.dualEntry.noAccountsFound')}
            subtitle={translate('workspace.dualEntry.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!syncReimbursedReports || !canConfigureCurrencyConversionFees}
            displayName="DualEntryFxExpenseAccountPage"
            title="workspace.dualEntry.fxExpenseAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.FX_EXPENSE_ACCOUNT_ID], dualentryConfig?.pendingFields)}
            errors={getLatestErrorField(dualentryConfig, CONST.DUALENTRY_CONFIG.FX_EXPENSE_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.FX_EXPENSE_ACCOUNT_ID)}
            confirmButtonOptions={confirmButtonOptions}
        />
    );
}

export default withPolicyConnections(DualEntryFxExpenseAccountPage);
