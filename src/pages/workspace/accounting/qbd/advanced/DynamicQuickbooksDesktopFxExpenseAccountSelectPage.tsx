import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';

import useCanConfigureCurrencyConversionFees from '@hooks/useCanConfigureCurrencyConversionFees';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useFxExpenseAccountPicker from '@hooks/useFxExpenseAccountPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksDesktopFxExpenseAccount} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import FxExpenseAccountSelectPage from '@pages/workspace/accounting/common/FxExpenseAccountSelectPage';
import {isQBDExportingOnPayment} from '@pages/workspace/accounting/qbd/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import {clearQBDErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function DynamicQuickbooksDesktopFxExpenseAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const canConfigureCurrencyConversionFees = useCanConfigureCurrencyConversionFees(policy);

    const policyID = policy?.id;
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

    const {searchableList, initiallyFocusedOptionKey, confirmButtonOptions} = buildList(accountOptions, saveSelectedAccount);

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbd.advancedConfig.fxExpenseAccountDescription')}</Text>
        </View>
    );

    return (
        <FxExpenseAccountSelectPage
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            shouldBeBlocked={!canConfigureCurrencyConversionFees || !isQBDExportingOnPayment(qbdConfig)}
            displayName="DynamicQuickbooksDesktopFxExpenseAccountSelectPage"
            data={searchableList}
            onSelectRow={selectAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.qbd.advancedConfig.fxExpenseAccount"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT)}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT)}
            emptyStateTitle={translate('workspace.qbd.noAccountsFound')}
            emptyStateSubtitle={translate('workspace.qbd.noAccountsFoundDescription')}
            confirmButtonOptions={confirmButtonOptions}
        >
            {listHeaderComponent}
        </FxExpenseAccountSelectPage>
    );
}

export default withPolicyConnections(DynamicQuickbooksDesktopFxExpenseAccountSelectPage);
