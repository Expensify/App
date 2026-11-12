import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletReimbursableExpensesExportDestination} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {RilletExportReimbursable} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type ReimbursableExpensesExportDestinationListItem = ListItem & {
    value: RilletExportReimbursable;
};

function RilletReimbursablePage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const exportReimbursable = rilletConfig?.export?.reimbursable ?? CONST.RILLET_EXPORT_REIMBURSABLE.VENDOR_BILL;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(policyID) : undefined;

    const data: ReimbursableExpensesExportDestinationListItem[] = Object.values(CONST.RILLET_EXPORT_REIMBURSABLE).map((destinationListItem) => ({
        value: destinationListItem,
        text: translate(`workspace.rillet.exportReimbursable.values.${destinationListItem}.label`),
        keyForList: destinationListItem,
        isSelected: exportReimbursable === destinationListItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.exportReimbursable.description')}</Text>
        </View>
    );

    const selectReimbursableExpensesExportDestination = (item: ReimbursableExpensesExportDestinationListItem) => {
        if (item.value !== exportReimbursable && policyID) {
            updateRilletReimbursableExpensesExportDestination(policyID, item.value, exportReimbursable);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletReimbursablePage"
            title="workspace.rillet.exportReimbursable.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectReimbursableExpensesExportDestination}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={exportReimbursable}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.REIMBURSABLE], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.REIMBURSABLE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.REIMBURSABLE)}
        />
    );
}

export default withPolicyConnections(RilletReimbursablePage);
