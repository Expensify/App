import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralAccountingMethod} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {BusinessCentralExport} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

type AccountingMethodListItem = ListItem & {
    value: BusinessCentralExport['accountingMethod'];
};

function BusinessCentralAccountingMethodSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const accountingMethod = businessCentralConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_ADVANCED.getRoute(policyID) : undefined;
    const autoSync = businessCentralConfig?.autoSync?.enabled ?? false;

    const data: AccountingMethodListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodItem) => ({
        value: accountingMethodItem,
        text: translate(`workspace.businessCentral.advanced.accountingMethods.values.${accountingMethodItem}`),
        alternateText: translate(`workspace.businessCentral.advanced.accountingMethods.alternateText.${accountingMethodItem}`),
        keyForList: accountingMethodItem,
        isSelected: accountingMethod === accountingMethodItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.advanced.accountingMethods.description')}</Text>
        </View>
    );

    const selectAccountingMethod = (item: AccountingMethodListItem) => {
        if (item.value !== accountingMethod && policyID) {
            updateBusinessCentralAccountingMethod(policyID, item.value, accountingMethod);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!autoSync}
            displayName="BusinessCentralAccountingMethodSelectPage"
            title="workspace.businessCentral.advanced.accountingMethods.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectAccountingMethod}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={accountingMethod}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.ACCOUNTING_METHOD], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.ACCOUNTING_METHOD)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.ACCOUNTING_METHOD)}
        />
    );
}

export default withPolicyConnections(BusinessCentralAccountingMethodSelectPage);
