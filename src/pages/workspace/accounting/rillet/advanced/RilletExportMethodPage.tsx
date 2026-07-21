import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletAccountingMethod} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {RilletExport} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

type AccountingMethodListItem = ListItem & {
    value: RilletExport['accountingMethod'];
};

function RilletExportMethodPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const accountingMethod = rilletConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_ADVANCED.getRoute(policyID) : undefined;

    const autoSync = rilletConfig?.autoSync?.enabled ?? true;
    const shouldBeBlocked = !autoSync;

    const data: AccountingMethodListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodItem) => ({
        value: accountingMethodItem,
        text: translate(`workspace.rillet.accountingMethods.values.${accountingMethodItem}`),
        alternateText: translate(`workspace.rillet.accountingMethods.alternateText.${accountingMethodItem}`),
        keyForList: accountingMethodItem,
        isSelected: accountingMethod === accountingMethodItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.accountingMethods.description')}</Text>
        </View>
    );

    const selectAccountingMethod = (item: AccountingMethodListItem) => {
        if (item.value !== accountingMethod && policyID) {
            updateRilletAccountingMethod(policyID, item.value, accountingMethod);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="RilletExportMethodPage"
            title="workspace.rillet.accountingMethods.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectAccountingMethod}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={accountingMethod}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.ACCOUNTING_METHOD], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.ACCOUNTING_METHOD)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.ACCOUNTING_METHOD)}
        />
    );
}

export default withPolicyConnections(RilletExportMethodPage);
