import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDualEntryErrorField, updateDualEntryAccountingMethod} from '@libs/actions/connections/DualEntry';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {DualEntryExport} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

type AccountingMethodListItem = ListItem & {
    value: DualEntryExport['accountingMethod'];
};

function DualEntryExportMethodPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const dualentryConfig = policy?.connections?.dualEntry?.config;
    const accountingMethod = dualentryConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DUALENTRY_ADVANCED.getRoute(policyID) : undefined;

    const autoSync = dualentryConfig?.autoSync?.enabled ?? false;
    const shouldBeBlocked = !autoSync;

    const data: AccountingMethodListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodItem) => ({
        value: accountingMethodItem,
        text: translate(`workspace.dualEntry.accountingMethods.values.${accountingMethodItem}`),
        alternateText: translate(`workspace.dualEntry.accountingMethods.alternateText.${accountingMethodItem}`),
        keyForList: accountingMethodItem,
        isSelected: accountingMethod === accountingMethodItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.dualEntry.accountingMethods.description')}</Text>
        </View>
    );

    const selectAccountingMethod = (item: AccountingMethodListItem) => {
        if (item.value !== accountingMethod && policyID) {
            updateDualEntryAccountingMethod(policyID, item.value, accountingMethod);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="DualEntryExportMethodPage"
            title="workspace.dualEntry.accountingMethods.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectAccountingMethod}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={accountingMethod}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DUALENTRY}
            pendingAction={settingsPendingAction([CONST.DUALENTRY_CONFIG.ACCOUNTING_METHOD], dualentryConfig?.pendingFields)}
            errors={getLatestErrorField(dualentryConfig, CONST.DUALENTRY_CONFIG.ACCOUNTING_METHOD)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDualEntryErrorField(policyID, CONST.DUALENTRY_CONFIG.ACCOUNTING_METHOD)}
        />
    );
}

export default withPolicyConnections(DualEntryExportMethodPage);
