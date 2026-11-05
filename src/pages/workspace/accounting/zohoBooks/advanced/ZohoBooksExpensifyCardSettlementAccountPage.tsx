/**
 * Lets an admin pick the workspace-level Zoho Books account that Expensify Card settlements are created in.
 * Settlements are in USD, so it lists only active USD bank and cash accounts.
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

import {clearZohoBooksErrorField, updateZohoBooksSettlementsAccount} from '@libs/actions/connections/ZohoBooks';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ZohoBooksBankAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: ZohoBooksBankAccount['id'];
};

function ZohoBooksExpensifyCardSettlementAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const settlementsBankAccountID = zohoBooksConfig?.sync?.settlementsBankAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_ADVANCED.getRoute(policyID) : undefined;

    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isExpensifyCardsEnabled = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const syncExpensifyCardSettlements = zohoBooksConfig?.sync?.syncExpensifyCardSettlements ?? true;
    const shouldBeBlocked = !isExpensifyCardsEnabled || !syncExpensifyCardSettlements;

    const data: AccountListItem[] =
        zohoBooksData?.bankAccounts
            ?.filter(
                (accountItem) =>
                    accountItem.isActive &&
                    (accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.BANK || accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.CASH) &&
                    accountItem.currency === CONST.CURRENCY.USD,
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: accountItem.name,
                keyForList: accountItem.id,
                isSelected: settlementsBankAccountID === accountItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.settlementAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.zohoBooks.noAccountsFound')}
            subtitle={translate('workspace.zohoBooks.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const setSettlementsAccount = (item: AccountListItem) => {
        if (item.value !== settlementsBankAccountID && policyID) {
            updateZohoBooksSettlementsAccount(policyID, item.value, settlementsBankAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="ZohoBooksExpensifyCardSettlementAccountPage"
            title="workspace.zohoBooks.settlementAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={setSettlementsAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={settlementsBankAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, CONST.ZOHO_BOOKS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(ZohoBooksExpensifyCardSettlementAccountPage);
