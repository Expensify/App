/**
 * Lets an admin pick the workspace-level Zoho Books account that Consolidated Travel Billing settlements are created in.
 * Settlements are in USD, so it lists only active USD bank and cash accounts.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';
import useTravelBillingFundID from '@hooks/useTravelBillingFundID';

import {clearZohoBooksErrorField, updateZohoBooksTravelBillingSettlementsAccount} from '@libs/actions/connections/ZohoBooks';
import {getCardSettings} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import {getIsTravelBillingEnabled, getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

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

function ZohoBooksTravelInvoicingSettlementAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const zohoBooksData = policy?.connections?.zohoBooks?.data;
    const travelInvoicingSettlementsBankAccountID = zohoBooksConfig?.sync?.travelInvoicingSettlementsBankAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_ADVANCED.getRoute(policyID) : undefined;

    const travelBillingFundID = useTravelBillingFundID(policyID);
    const [cardSettings] = useOnyx(getTravelBillingCardSettingsKey(travelBillingFundID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelBillingEnabled = getIsTravelBillingEnabled(travelSettings);
    const syncTravelInvoicingSettlements = zohoBooksConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const shouldBeBlocked = !isTravelBillingEnabled || !syncTravelInvoicingSettlements;

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
                isSelected: travelInvoicingSettlementsBankAccountID === accountItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.travelBillingSettlementAccount.description')}</Text>
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

    const setTravelInvoicingSettlementsAccount = (item: AccountListItem) => {
        if (item.value !== travelInvoicingSettlementsBankAccountID && policyID) {
            updateZohoBooksTravelBillingSettlementsAccount(policyID, item.value, travelInvoicingSettlementsBankAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="ZohoBooksTravelInvoicingSettlementAccountPage"
            title="workspace.zohoBooks.travelBillingSettlementAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            shouldShowListEmptyContent={!textInputOptions.value}
            onSelectRow={setTravelInvoicingSettlementsAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={travelInvoicingSettlementsBankAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(ZohoBooksTravelInvoicingSettlementAccountPage);
