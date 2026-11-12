/**
 * Lets an admin choose the Digits bank or credit card account that company card transactions export to. Until one is
 * picked, the first active credit card account is used.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDigitsErrorField, updateDigitsCreditCardAccount} from '@libs/actions/connections/Digits';
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

import getDigitsCompanyCardAccount from './getDigitsCompanyCardAccount';

type AccountListItem = ListItem & {
    value: DigitsAccount['id'];
};

function DigitsCompanyCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const digitsData = policy?.connections?.digits?.data;
    const creditCardAccountID = digitsConfig?.export?.creditCardAccountID;
    const selectedAccountID = getDigitsCompanyCardAccount(policy)?.id;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DIGITS_EXPORT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        digitsData?.accounts
            ?.filter(
                (accountItem) =>
                    accountItem.isActive && (accountItem.subtype === CONST.DIGITS_ACCOUNT_SUBTYPE.CREDIT_CARDS || accountItem.subtype === CONST.DIGITS_ACCOUNT_SUBTYPE.BANK_ACCOUNTS),
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: accountItem.name,
                keyForList: accountItem.id,
                isSelected: selectedAccountID === accountItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.digits.companyCardAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.digits.noAccountsFound')}
            subtitle={translate('workspace.digits.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectCreditCardAccount = (item: AccountListItem) => {
        // Compare with the saved account, not the default shown, so picking the default saves it and a later change to the default doesn't move the admin's choice
        if (item.value !== creditCardAccountID && policyID) {
            updateDigitsCreditCardAccount(policyID, item.value, creditCardAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DigitsCompanyCardAccountPage"
            title="workspace.digits.companyCardAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={selectCreditCardAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={selectedAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.CREDIT_CARD_ACCOUNT_ID], digitsConfig?.pendingFields)}
            errors={getLatestErrorField(digitsConfig, CONST.DIGITS_CONFIG.CREDIT_CARD_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.CREDIT_CARD_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(DigitsCompanyCardAccountPage);
