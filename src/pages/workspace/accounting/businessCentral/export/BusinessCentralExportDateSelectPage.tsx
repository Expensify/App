import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralExportDate} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {BusinessCentralExport} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type ExportDateListItem = ListItem & {
    value: BusinessCentralExport['exportDate'];
};

function BusinessCentralExportDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const exportDate = businessCentralConfig?.export?.exportDate ?? CONST.BUSINESS_CENTRAL_EXPORT_DATE.LAST_EXPENSE;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_EXPORT.getRoute(policyID) : undefined;

    const data: ExportDateListItem[] = Object.values(CONST.BUSINESS_CENTRAL_EXPORT_DATE).map((exportDateItem) => ({
        value: exportDateItem,
        text: translate(`workspace.businessCentral.exportDate.values.${exportDateItem}.label`),
        alternateText: translate(`workspace.businessCentral.exportDate.values.${exportDateItem}.description`),
        keyForList: exportDateItem,
        isSelected: exportDate === exportDateItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.businessCentral.exportDate.description')}</Text>
        </View>
    );

    const selectExportDate = (item: ExportDateListItem) => {
        if (item.value !== exportDate && policyID) {
            updateBusinessCentralExportDate(policyID, item.value, businessCentralConfig?.export?.exportDate);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralExportDateSelectPage"
            title="workspace.businessCentral.exportDate.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectExportDate}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={exportDate}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_DATE], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.EXPORT_DATE)}
        />
    );
}

export default withPolicyConnections(BusinessCentralExportDateSelectPage);
