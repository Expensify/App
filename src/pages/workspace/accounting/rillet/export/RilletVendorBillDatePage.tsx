import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearRilletErrorField, updateRilletExportDate} from '@libs/actions/connections/Rillet';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {RilletExportDate} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type ExportDateListItem = ListItem & {
    value: RilletExportDate;
};

function RilletVendorBillDatePage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;
    const exportDate = rilletConfig?.export?.exportDate ?? CONST.RILLET_EXPORT_DATE.LAST_EXPENSE;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_RILLET_EXPORT.getRoute(policyID) : undefined;

    const data: ExportDateListItem[] = Object.values(CONST.RILLET_EXPORT_DATE).map((exportDateItem) => ({
        value: exportDateItem,
        text: translate(`workspace.rillet.exportDate.values.${exportDateItem}.label`),
        alternateText: translate(`workspace.rillet.exportDate.values.${exportDateItem}.description`),
        keyForList: exportDateItem,
        isSelected: exportDate === exportDateItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.rillet.exportDate.description')}</Text>
        </View>
    );

    const selectExportDate = (item: ExportDateListItem) => {
        if (item.value !== exportDate && policyID) {
            updateRilletExportDate(policyID, item.value, exportDate);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="RilletVendorBillDatePage"
            title="workspace.rillet.exportDate.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectExportDate}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={exportDate}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
            pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.EXPORT_DATE], rilletConfig?.pendingFields)}
            errors={getLatestErrorField(rilletConfig, CONST.RILLET_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.EXPORT_DATE)}
        />
    );
}

export default withPolicyConnections(RilletVendorBillDatePage);
