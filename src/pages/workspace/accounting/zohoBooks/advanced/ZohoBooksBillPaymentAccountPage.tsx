/**
 * Lets an admin pick the Zoho Books account that bill payments are recorded against when Expensify marks a reimbursed report's bill paid.
 * It lists only active bank and cash accounts, and is only reachable while reimbursed report sync is on.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearZohoBooksErrorField, updateZohoBooksBillPaymentAccount} from '@libs/actions/connections/ZohoBooks';
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

function ZohoBooksBillPaymentAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const billPaymentAccountID = zohoBooksConfig?.sync?.billPaymentAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_ADVANCED.getRoute(policyID) : undefined;

    const syncReimbursedReports = zohoBooksConfig?.sync?.syncReimbursedReports ?? true;
    const shouldBeBlocked = !syncReimbursedReports;

    const data: AccountListItem[] =
        zohoBooksData?.bankAccounts
            ?.filter(
                (accountItem) => accountItem.isActive && (accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.BANK || accountItem.accountType === CONST.ZOHO_BOOKS_ACCOUNT_TYPE.CASH),
            )
            .map((accountItem) => ({
                value: accountItem.id,
                text: accountItem.name,
                keyForList: accountItem.id,
                isSelected: billPaymentAccountID === accountItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.billPaymentAccount.description')}</Text>
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

    const setBillPaymentAccount = (item: AccountListItem) => {
        if (item.value !== billPaymentAccountID && policyID) {
            updateZohoBooksBillPaymentAccount(policyID, item.value, billPaymentAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="ZohoBooksBillPaymentAccountPage"
            title="workspace.zohoBooks.billPaymentAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={setBillPaymentAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={billPaymentAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.BILL_PAYMENT_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, CONST.ZOHO_BOOKS_CONFIG.BILL_PAYMENT_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.BILL_PAYMENT_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(ZohoBooksBillPaymentAccountPage);
