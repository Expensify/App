/**
 * Lets an admin choose which date the vendor bills exported to Digits carry.
 */
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDigitsErrorField, updateDigitsExportDate} from '@libs/actions/connections/Digits';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {DigitsExportDate} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type ExportDateListItem = ListItem & {
    value: DigitsExportDate;
};

function DigitsVendorBillDatePage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const exportDate = digitsConfig?.export?.exportDate ?? CONST.DIGITS_EXPORT_DATE.LAST_EXPENSE;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_DIGITS_EXPORT.getRoute(policyID) : undefined;

    const data: ExportDateListItem[] = Object.values(CONST.DIGITS_EXPORT_DATE).map((exportDateItem) => ({
        value: exportDateItem,
        text: translate(`workspace.digits.exportDate.values.${exportDateItem}.label`),
        alternateText: translate(`workspace.digits.exportDate.values.${exportDateItem}.description`),
        keyForList: exportDateItem,
        isSelected: exportDate === exportDateItem,
    }));

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.digits.exportDate.description')}</Text>
        </View>
    );

    const selectExportDate = (item: ExportDateListItem) => {
        if (item.value !== exportDate && policyID) {
            updateDigitsExportDate(policyID, item.value, exportDate);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DigitsVendorBillDatePage"
            title="workspace.digits.exportDate.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectExportDate}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={exportDate}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.EXPORT_DATE], digitsConfig?.pendingFields)}
            errors={getLatestErrorField(digitsConfig, CONST.DIGITS_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.EXPORT_DATE)}
        />
    );
}

export default withPolicyConnections(DigitsVendorBillDatePage);
