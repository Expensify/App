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

import {isCertiniaFFAConnection} from '@pages/workspace/accounting/certinia/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React, {useState} from 'react';
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
    const persistedAccountID = config?.fxExpenseAccount ?? '';
    const [draftAccountID, setDraftAccountID] = useState<string>();
    const selectedAccountID = draftAccountID ?? persistedAccountID;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_CERTINIA_FX_EXPENSE_ACCOUNT.path);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const accountOptions: ExpenseAccountListItem[] = expenseAccounts.map((account) => ({
        value: account.id,
        text: account.name,
        keyForList: account.id,
        isSelected: selectedAccountID === account.id,
    }));

    // A Certinia chart of accounts runs to hundreds of General Ledger Accounts, so the list needs a search box.
    const {filteredData: filteredAccounts, textInputOptions} = useSelectionListSearch(accountOptions);

    const noneOption: ExpenseAccountListItem = {
        value: '',
        text: translate('common.none'),
        keyForList: CONST.SEARCH.NONE_OPTION_KEY,
        isSelected: !selectedAccountID,
    };

    // Don't prepend None onto an empty account list or the empty-state BlockingView never shows.
    const shouldShowNoneOption = expenseAccounts.length > 0 || !!persistedAccountID;
    const listData = shouldShowNoneOption ? [noneOption, ...filteredAccounts] : filteredAccounts;

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
        setDraftAccountID(row.value);
    };

    const saveSelectedAccount = () => {
        if (selectedAccountID !== persistedAccountID && policyID) {
            updateFinancialForceFxExpenseAccount(policyID, selectedAccountID, config?.fxExpenseAccount ?? null);
        }
        Navigation.goBack(backPath);
    };

    const confirmButtonOptions = {
        showButton: shouldShowNoneOption,
        text: translate('common.save'),
        onConfirm: saveSelectedAccount,
        isDisabled: selectedAccountID === persistedAccountID,
    };

    const noneOptionKey = shouldShowNoneOption ? CONST.SEARCH.NONE_OPTION_KEY : undefined;
    const initiallyFocusedOptionKey = persistedAccountID.length > 0 ? persistedAccountID : noneOptionKey;

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!isCertiniaFFAConnection(config) || !canConfigureCurrencyConversionFees}
            displayName="CertiniaFxExpenseAccountSelectPage"
            data={listData}
            textInputOptions={textInputOptions}
            headerContent={listHeaderComponent}
            onSelectRow={selectAccount}
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            title="workspace.certinia.fxExpenseAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT)}
            confirmButtonOptions={confirmButtonOptions}
        />
    );
}

export default withPolicyConnections(CertiniaFxExpenseAccountSelectPage);
