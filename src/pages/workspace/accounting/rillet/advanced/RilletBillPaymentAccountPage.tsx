import React from 'react';
import {View} from 'react-native';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearRilletErrorField, updateRilletCreditCardAccount} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {RilletAccount} from '@src/types/onyx/Policy';

type AccountListItem = ListItem & {
    value: RilletAccount['id'];
};

function RilletCompanyCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const rilletData = policy?.connections?.rillet?.data;
    const companyCardAccount = rilletData?.accounts?.find((account) => account.code === rilletConfig?.export?.creditCardAccountCode);
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_ADVANCED.getRoute(policyID) : undefined;

    const data: AccountListItem[] =
        rilletData?.accounts?.map((accountItem) => ({
            value: accountItem.id,
            text: accountItem.name,
            keyForList: accountItem.id,
            isSelected: companyCardAccount?.id === accountItem.id,
        })) ?? [];

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.companyCardAccount.description')}</Text>
        </View>
    );

    const selectDefaultVendor = (item: AccountListItem) => {
        if (item.value !== companyCardAccount?.id && policyID) {
            updateRilletCreditCardAccount(policyID, item.value, companyCardAccount?.id);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletCompanyCardAccountPage"
            title="workspace.rillet.companyCardAccount.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectDefaultVendor}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={companyCardAccount?.id}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.CREDIT_CARD_ACCOUNTCODE)}
        />
    );
}

export default withPolicyConnections(RilletCompanyCardAccountPage);
