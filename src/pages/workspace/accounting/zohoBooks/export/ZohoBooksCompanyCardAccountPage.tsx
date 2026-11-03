/**
 * Lets an admin pick the Zoho Books account that company card expenses export to.
 * It lists the active bank and credit card accounts the backend syncs for this picker, since saving only accepts one of those.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearZohoBooksErrorField, updateZohoBooksCreditCardAccount} from '@libs/actions/connections/ZohoBooks';
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

function ZohoBooksCompanyCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const creditCardAccountID = zohoBooksConfig?.export?.creditCardAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXPORT.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        zohoBooksData?.bankAccounts?.map((accountItem) => ({
            value: accountItem.id,
            text: accountItem.name,
            keyForList: accountItem.id,
            isSelected: creditCardAccountID === accountItem.id,
        })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.companyCardAccount.description')}</Text>
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

    const selectCreditCardAccount = (item: AccountListItem) => {
        if (item.value !== creditCardAccountID && policyID) {
            updateZohoBooksCreditCardAccount(policyID, item.value, creditCardAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="ZohoBooksCompanyCardAccountPage"
            title="workspace.zohoBooks.companyCardAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={selectCreditCardAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={creditCardAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.CREDIT_CARD_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, CONST.ZOHO_BOOKS_CONFIG.CREDIT_CARD_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.CREDIT_CARD_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(ZohoBooksCompanyCardAccountPage);
