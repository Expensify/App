import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineSyncCustomers} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: keyof typeof CONST.INTEGRATION_ENTITY_MAP_TYPES;
};

function QuickbooksCustomersDisplayedAsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const data: CardListItem[] = useMemo(
        () => [
            {
                value: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                text: translate('workspace.common.tags'),
                keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                isSelected: qboConfig?.syncCustomers === CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            },
            {
                value: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
                text: translate('workspace.common.reportFields'),
                keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
                isSelected: qboConfig?.syncCustomers === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            },
        ],
        [qboConfig?.syncCustomers, translate],
    );

    const selectDisplayedAs = useCallback(
        (row: CardListItem) => {
            if (row.value !== qboConfig?.syncCustomers) {
                if (row.value === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD && !isControlPolicy(policy)) {
                    Navigation.navigate(
                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.REPORT_FIELDS_FEATURE.qbo.customers, ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.getRoute(policyID)),
                    );
                    return;
                }
                updateQuickbooksOnlineSyncCustomers(policyID, row.value, qboConfig?.syncCustomers);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.getRoute(policyID));
        },
        [qboConfig?.syncCustomers, policyID, policy],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksCustomersDisplayedAsPage"
            data={data}
            listItem={RadioListItem}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.getRoute(policyID))}
            onSelectRow={(selection) => selectDisplayedAs(selection as CardListItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((item) => item.isSelected)?.keyForList}
            title="workspace.common.displayedAs"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS)}
        />
    );
}

export default withPolicyConnections(QuickbooksCustomersDisplayedAsPage);
