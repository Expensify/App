/**
 * Lets an admin choose whether auto-sync exports Digits reports when they're final approved (Accrual) or when they're
 * paid (Cash). It's only reachable while auto-sync is on.
 */
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDigitsErrorField, updateDigitsAccountingMethod} from '@libs/actions/connections/Digits';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {DigitsExport} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

type AccountingMethodListItem = ListItem & {
    value: DigitsExport['accountingMethod'];
};

function DigitsExportMethodPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const accountingMethod = digitsConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DIGITS_ADVANCED.getRoute(policyID) : undefined;
    const autoSync = digitsConfig?.autoSync?.enabled ?? false;

    const data: AccountingMethodListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodItem) => ({
        value: accountingMethodItem,
        text: translate(`workspace.digits.accountingMethods.values.${accountingMethodItem}`),
        alternateText: translate(`workspace.digits.accountingMethods.alternateText.${accountingMethodItem}`),
        keyForList: accountingMethodItem,
        isSelected: accountingMethod === accountingMethodItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.digits.accountingMethods.description')}</Text>
        </View>
    );

    const selectAccountingMethod = (item: AccountingMethodListItem) => {
        if (item.value !== accountingMethod && policyID) {
            updateDigitsAccountingMethod(policyID, item.value, accountingMethod);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={!autoSync}
            displayName="DigitsExportMethodPage"
            title="workspace.digits.accountingMethods.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectAccountingMethod}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={accountingMethod}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.ACCOUNTING_METHOD], digitsConfig?.pendingFields)}
            errors={getLatestErrorField(digitsConfig, CONST.DIGITS_CONFIG.ACCOUNTING_METHOD)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.ACCOUNTING_METHOD)}
        />
    );
}

export default withPolicyConnections(DigitsExportMethodPage);
