import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntryBillPaymentAccount} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {DualEntryAccount} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type AccountListItem = ListItem & {
    value: DualEntryAccount['id'];
};

function DualEntryBillPaymentAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const dualentryData = policy?.connections?.dualEntry?.data;
    const billPaymentAccountID = dualentryConfig?.sync?.billPaymentAccountID;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute(policyID) : undefined;

    const syncReimbursedReports = dualentryConfig?.sync?.syncReimbursedReports ?? true;
    const shouldBeBlocked = !syncReimbursedReports;

    const data: AccountListItem[] =
        dualentryData?.accounts
            ?.filter((accountItem) => accountItem.isActive && accountItem.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.BANK)
            .map((accountItem) => ({
                value: accountItem.id,
                text: `${accountItem.id} ${accountItem.name}`,
                keyForList: accountItem.id,
                isSelected: billPaymentAccountID === accountItem.id,
            })) ?? [];
    const {filteredData, textInputOptions} = useSelectionListSearch(data);

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.dualEntry.billPaymentAccount.description')}</Text>
        </View>
    );

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.dualEntry.noAccountsFound')}
            subtitle={translate('workspace.dualEntry.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const setBillPaymentAccount = (item: AccountListItem) => {
        if (item.value !== billPaymentAccountID && policyID) {
            updateDualEntryBillPaymentAccount(policyID, item.value, billPaymentAccountID);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="DualEntryBillPaymentAccountPage"
            title="workspace.dualEntry.billPaymentAccount.label"
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={headerContent}
            listEmptyContent={listEmptyContent}
            onSelectRow={setBillPaymentAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={billPaymentAccountID}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.BILL_PAYMENT_ACCOUNT_ID], dualentryConfig?.pendingFields)}
            errors={getLatestErrorField(dualentryConfig, CONST.DUALENTRY_CONFIG.BILL_PAYMENT_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.BILL_PAYMENT_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(DualEntryBillPaymentAccountPage);
