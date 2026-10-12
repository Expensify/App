import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearCampfireErrorField, updateCampfireBillPaymentAccount} from '@libs/actions/connections/Campfire';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {CampfireAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: CampfireAccount['id'];
};

function CampfireBillPaymentAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const campfireConfig = policy?.connections?.campfire?.config;
    const campfireData = policy?.connections?.campfire?.data;
    const billPaymentAccountID = campfireConfig?.sync?.billPaymentAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_CAMPFIRE_ADVANCED.getRoute(policyID) : undefined;

    const syncReimbursedReports = campfireConfig?.sync?.syncReimbursedReports ?? true;
    const shouldBeBlocked = !syncReimbursedReports;

    const data: AccountListItem[] =
        campfireData?.accounts
            ?.filter((accountItem) => accountItem.isActive && accountItem.accountSubtype === CONST.CAMPFIRE_ACCOUNT_SUBTYPE.BANK)
            .map((accountItem) => ({
                value: accountItem.id,
                text: `${accountItem.id} ${accountItem.name}`,
                keyForList: accountItem.id,
                isSelected: billPaymentAccountID === accountItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.campfire.billPaymentAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.campfire.noAccountsFound')}
            subtitle={translate('workspace.campfire.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const setBillPaymentAccount = (item: AccountListItem) => {
        if (item.value !== billPaymentAccountID && policyID) {
            updateCampfireBillPaymentAccount(policyID, item.value, billPaymentAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="CampfireBillPaymentAccountPage"
            title="workspace.campfire.billPaymentAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={setBillPaymentAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={billPaymentAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE}
            pendingAction={settingsPendingAction([CONST.CAMPFIRE_CONFIG.BILL_PAYMENT_ACCOUNT_ID], campfireConfig?.pendingFields)}
            errors={getLatestErrorField(campfireConfig, CONST.CAMPFIRE_CONFIG.BILL_PAYMENT_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearCampfireErrorField(policyID, CONST.CAMPFIRE_CONFIG.BILL_PAYMENT_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(CampfireBillPaymentAccountPage);
