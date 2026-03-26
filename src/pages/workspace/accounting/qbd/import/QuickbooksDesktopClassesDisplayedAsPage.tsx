import React, {useCallback} from 'react';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopSyncClasses} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: keyof typeof CONST.INTEGRATION_ENTITY_MAP_TYPES;
};

function QuickbooksDesktopClassesDisplayedAsPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;

    const data: CardListItem[] = [
        {
            value: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            text: translate('workspace.common.tags'),
            alternateText: translate('workspace.qbd.tagsDisplayedAsDescription'),
            keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            isSelected: qbdConfig?.mappings?.classes === CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
        },
        {
            value: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            text: translate('workspace.common.reportFields'),
            alternateText: translate('workspace.qbd.reportFieldsDisplayedAsDescription'),
            keyForList: CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
            isSelected: qbdConfig?.mappings?.classes === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
        },
    ];

    const selectDisplayedAs = useCallback(
        (row: CardListItem) => {
            if (row.value !== qbdConfig?.mappings?.classes) {
                updateQuickbooksDesktopSyncClasses(policyID, row.value, qbdConfig?.mappings?.classes);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.getRoute(policyID));
        },
        [qbdConfig?.mappings?.classes, policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksDesktopClassesDisplayedAsPage"
            data={data}
            listItem={RadioListItem}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.getRoute(policyID))}
            onSelectRow={selectDisplayedAs}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.common.displayedAs"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES)}
            shouldSingleExecuteRowSelect
        />
    );
}

export default withPolicyConnections(QuickbooksDesktopClassesDisplayedAsPage);
