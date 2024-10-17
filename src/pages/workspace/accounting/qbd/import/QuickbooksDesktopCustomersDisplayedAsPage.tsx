import React, {useCallback} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: keyof typeof CONST.INTEGRATION_ENTITY_MAP_TYPES;
};

function QuickbooksDesktopCustomersDisplayedAsPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const {canUseNewDotQBD} = usePermissions();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;

    const data: CardListItem[] = [
        {
            value: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            text: translate('workspace.common.tags'),
            alternateText: translate('workspace.qbd.tagsDisplayedAsDescription'),
            keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            isSelected: qbdConfig?.mappings?.customers === CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
        },
        {
            value: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            text: translate('workspace.common.reportFields'),
            alternateText: translate('workspace.qbd.reportFieldsDisplayedAsDescription'),
            keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            isSelected: qbdConfig?.mappings?.customers === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
        },
    ];

    const selectDisplayedAs = useCallback(
        (row: CardListItem) => {
            if (row.value !== qbdConfig?.mappings?.customers) {
                QuickbooksDesktop.updateQuickbooksDesktopSyncCustomers(policyID, row.value, qbdConfig?.mappings?.customers);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS.getRoute(policyID));
        },
        [qbdConfig?.mappings?.customers, policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopCustomersDisplayedAsPage.displayName}
            sections={data.length ? [{data}] : []}
            listItem={RadioListItem}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS.getRoute(policyID))}
            onSelectRow={selectDisplayedAs}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.common.displayedAs"
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS], qbdConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS)}
            shouldSingleExecuteRowSelect
        />
    );
}

QuickbooksDesktopCustomersDisplayedAsPage.displayName = 'QuickbooksDesktopCustomersDisplayedAsPage';

export default withPolicyConnections(QuickbooksDesktopCustomersDisplayedAsPage);
