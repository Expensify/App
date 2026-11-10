/**
 * Lets an admin choose whether Zoho Books auto sync exports out-of-pocket expenses when they're final approved (accrual) or when they're paid (cash).
 * It's only reachable while auto sync is on.
 */
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearZohoBooksErrorField, updateZohoBooksAccountingMethod} from '@libs/actions/connections/ZohoBooks';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ZohoBooksExport} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';

type AccountingMethodListItem = ListItem & {
    value: ZohoBooksExport['accountingMethod'];
};

function ZohoBooksExportMethodPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const zohoBooksConfig = policy?.connections?.zohoBooks?.config;
    const accountingMethod = zohoBooksConfig?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_ADVANCED.getRoute(policyID) : undefined;

    const autoSync = zohoBooksConfig?.autoSync?.enabled ?? false;
    const shouldBeBlocked = !autoSync;

    const data: AccountingMethodListItem[] = Object.values(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD).map((accountingMethodItem) => ({
        value: accountingMethodItem,
        text: translate(`workspace.zohoBooks.accountingMethods.values.${accountingMethodItem}`),
        alternateText: translate(`workspace.zohoBooks.accountingMethods.alternateText.${accountingMethodItem}`),
        keyForList: accountingMethodItem,
        isSelected: accountingMethod === accountingMethodItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.zohoBooks.accountingMethods.description')}</Text>
        </View>
    );

    const selectAccountingMethod = (item: AccountingMethodListItem) => {
        if (item.value !== accountingMethod && policyID) {
            updateZohoBooksAccountingMethod(policyID, item.value, accountingMethod);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldBeBlocked={shouldBeBlocked}
            displayName="ZohoBooksExportMethodPage"
            title="workspace.zohoBooks.accountingMethods.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectAccountingMethod}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={accountingMethod}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS}
            pendingAction={settingsPendingAction([CONST.ZOHO_BOOKS_CONFIG.ACCOUNTING_METHOD], zohoBooksConfig?.pendingFields)}
            errors={getLatestErrorField(zohoBooksConfig, CONST.ZOHO_BOOKS_CONFIG.ACCOUNTING_METHOD)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearZohoBooksErrorField(policyID, CONST.ZOHO_BOOKS_CONFIG.ACCOUNTING_METHOD)}
        />
    );
}

export default withPolicyConnections(ZohoBooksExportMethodPage);
