import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletSettlementsAccount} from '@libs/actions/connections/Rillet';
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

function RilletExpensifyCardSettlementAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const settlementsBankAccountID = rilletConfig?.sync?.settlementsBankAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_ADVANCED.getRoute(policyID) : undefined;

    const syncExpensifyCardSettlements = rilletConfig?.sync?.syncExpensifyCardSettlements ?? true;
    const shouldBeBlocked = !syncExpensifyCardSettlements;

    const data: BankAccountListItem[] =
        rilletData?.bankAccounts
            ?.filter((bankAccountItem) => bankAccountItem.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE)
            .map((bankAccountItem) => ({
                value: bankAccountItem.id,
                text: bankAccountItem.name,
                keyForList: bankAccountItem.id,
                isSelected: settlementsBankAccountID === bankAccountItem.id,
            })) ?? [];

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.settlementAccount.description')}</Text>
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

    const setSettlementsAccount = (item: BankAccountListItem) => {
        if (item.value !== settlementsBankAccountID && policyID) {
            updateRilletSettlementsAccount(policyID, item.value, settlementsBankAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="RilletExpensifyCardSettlementAccountPage"
            title="workspace.rillet.settlementAccount.label"
            data={data}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={setSettlementsAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={settlementsBankAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(RilletExpensifyCardSettlementAccountPage);
