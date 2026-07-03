import React from 'react';
import {View} from 'react-native';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearRilletErrorField, updateRilletBillPaymentAccount} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {RilletAccount} from '@src/types/onyx/Policy';

type AccountListItem = ListItem & {
    value: RilletAccount['code'];
};

function RilletBillPaymentAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const billPaymentAccountCode = rilletConfig?.sync?.billPaymentAccountCode;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_ADVANCED.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        rilletData?.accounts
            ?.filter((accountItem) => accountItem.type === CONST.RILLET_ACCOUNT_TYPE.ASSET && accountItem.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE)
            .map((accountItem) => ({
                value: accountItem.code,
                text: accountItem.name,
                keyForList: accountItem.code,
                isSelected: billPaymentAccountCode === accountItem.code,
            })) ?? [];

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.billPaymentAccount.description')}</Text>
        </View>
    );

    const setBillPaymentAccount = (item: AccountListItem) => {
        if (item.value !== billPaymentAccountCode && policyID) {
            updateRilletBillPaymentAccount(policyID, item.value, billPaymentAccountCode);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletBillPaymentAccountPage"
            title="workspace.rillet.billPaymentAccount.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={setBillPaymentAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={billPaymentAccountCode}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.BILL_PAYMENT_ACCOUNT_CODE], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.BILL_PAYMENT_ACCOUNT_CODE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.BILL_PAYMENT_ACCOUNT_CODE)}
        />
    );
}

export default withPolicyConnections(RilletBillPaymentAccountPage);
