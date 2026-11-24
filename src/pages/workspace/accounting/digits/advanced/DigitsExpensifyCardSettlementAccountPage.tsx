/**
 * Lets an admin choose the Digits bank account that Expensify Card settlements are paid from. Until one is picked, the
 * sync uses the first active bank account, or the first bank account when none is active.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDigitsErrorField, updateDigitsSettlementsAccount} from '@libs/actions/connections/Digits';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {DigitsAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

import {getDigitsBankAccount, getDigitsBankAccounts} from './DigitsAdvancedAccountUtils';

type AccountListItem = ListItem & {
    value: DigitsAccount['id'];
};

function DigitsExpensifyCardSettlementAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const settlementsBankAccountID = digitsConfig?.sync?.settlementsBankAccountID;
    const selectedAccountID = getDigitsBankAccount(policy, settlementsBankAccountID)?.id;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DIGITS_ADVANCED.getRoute(policyID) : undefined;

    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const syncExpensifyCardSettlements = digitsConfig?.sync?.syncExpensifyCardSettlements ?? true;

    const data: AccountListItem[] = getDigitsBankAccounts(policy).map((accountItem) => ({
        value: accountItem.id,
        text: accountItem.name,
        keyForList: accountItem.id,
        isSelected: selectedAccountID === accountItem.id,
    }));
    const {filteredData, textInputOptions} = useSelectionListSearch(data, translate('common.noResultsFound'));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.digits.settlementAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.digits.noAccountsFound')}
            subtitle={translate('workspace.digits.noBankAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectSettlementsAccount = (item: AccountListItem) => {
        // Compare with the saved account, not the default shown, so picking the default saves it and a later change to the default doesn't move the admin's choice
        if (item.value !== settlementsBankAccountID && policyID) {
            updateDigitsSettlementsAccount(policyID, item.value, settlementsBankAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!isExpensifyCardsEnabled || !syncExpensifyCardSettlements}
            displayName="DigitsExpensifyCardSettlementAccountPage"
            title="workspace.digits.settlementAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={selectSettlementsAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], digitsConfig?.pendingFields)}
            errors={getLatestErrorField(digitsConfig, CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(DigitsExpensifyCardSettlementAccountPage);
