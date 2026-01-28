import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineSyncLocations} from '@libs/actions/connections/QuickbooksOnline';
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

function QuickbooksLocationsDisplayedAsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const data: CardListItem[] = useMemo(() => {
        const items: CardListItem[] = [];

        if (
            qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY &&
            qboConfig?.nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_ACCOUNT_TYPE.CREDIT_CARD
        ) {
            items.push({
                value: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                text: translate('workspace.common.tags'),
                keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                isSelected: qboConfig?.syncLocations === CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            });
        }

        items.push({
            value: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            text: translate('workspace.common.reportFields'),
            keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            isSelected: qboConfig?.syncLocations === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
        });

        return items;
    }, [qboConfig?.syncLocations, qboConfig?.reimbursableExpensesExportDestination, qboConfig?.nonReimbursableExpensesExportDestination, translate]);

    const selectDisplayedAs = useCallback(
        (row: CardListItem) => {
            if (row.value !== qboConfig?.syncLocations) {
                if (row.value === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD && !isControlPolicy(policy)) {
                    Navigation.navigate(
                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.REPORT_FIELDS_FEATURE.qbo.locations, ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID)),
                    );
                    return;
                }
                updateQuickbooksOnlineSyncLocations(policyID, row.value, qboConfig?.syncLocations);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID));
        },
        [qboConfig?.syncLocations, policyID, policy],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksLocationsDisplayedAsPage"
            data={data}
            listItem={RadioListItem}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID))}
            onSelectRow={(selection) => selectDisplayedAs(selection as CardListItem)}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((item) => item.isSelected)?.keyForList}
            title="workspace.common.displayedAs"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
        />
    );
}

export default withPolicyConnections(QuickbooksLocationsDisplayedAsPage);
