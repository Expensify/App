import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletTravelInvoicingSettlementsAccount} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {RilletBankAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type BankAccountListItem = ListItem & {
    value: RilletBankAccount['id'];
};

function RilletTravelInvoicingSettlementAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const travelInvoicingSettlementsBankAccountID = rilletConfig?.sync?.travelInvoicingSettlementsBankAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_ADVANCED.getRoute(policyID) : undefined;

    const syncTravelInvoicingSettlements = rilletConfig?.sync?.syncTravelInvoicingSettlements ?? true;
    const shouldBeBlocked = !syncTravelInvoicingSettlements;

    const data: BankAccountListItem[] =
        rilletData?.bankAccounts
            ?.filter((bankAccountItem) => bankAccountItem.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE)
            .map((bankAccountItem) => ({
                value: bankAccountItem.id,
                text: bankAccountItem.name,
                keyForList: bankAccountItem.id,
                isSelected: travelInvoicingSettlementsBankAccountID === bankAccountItem.id,
            })) ?? [];

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.travelInvoicingSettlementAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.rillet.noBankAccountsFound')}
            subtitle={translate('workspace.rillet.noBankAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const setTravelInvoicingSettlementsAccount = (item: BankAccountListItem) => {
        if (item.value !== travelInvoicingSettlementsBankAccountID && policyID) {
            updateRilletTravelInvoicingSettlementsAccount(policyID, item.value, travelInvoicingSettlementsBankAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="RilletTravelInvoicingSettlementAccountPage"
            title="workspace.rillet.travelInvoicingSettlementAccount.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={setTravelInvoicingSettlementsAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={travelInvoicingSettlementsBankAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(RilletTravelInvoicingSettlementAccountPage);
