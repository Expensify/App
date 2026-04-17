import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksDesktopExportDate} from '@libs/actions/connections/QuickbooksDesktop';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

type CardListItem = ListItem & {
    value: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_DATE>;
};

function DynamicQuickbooksDesktopExportDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const exportDate = qbdConfig?.export?.exportDate;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT.path);

    const data: CardListItem[] = useMemo(
        () =>
            Object.values(CONST.QUICKBOOKS_EXPORT_DATE).map((dateType) => ({
                value: dateType,
                text: translate(`workspace.qbd.exportDate.values.${dateType}.label`),
                alternateText: translate(`workspace.qbd.exportDate.values.${dateType}.description`),
                keyForList: dateType,
                isSelected: exportDate === dateType,
            })),
        [exportDate, translate],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(backPath ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID));
    }, [policyID, backPath]);

    const selectExportDate = useCallback(
        (row: CardListItem) => {
            if (!policyID) {
                return;
            }
            if (row.value !== exportDate) {
                updateQuickbooksDesktopExportDate(policyID, row.value, exportDate);
            }
            goBack();
        },
        [policyID, exportDate, goBack],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksDesktopExportDateSelectPage"
            data={data}
            listItem={RadioListItem}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbd.exportDate.description')}</Text>}
            onBackButtonPress={goBack}
            onSelectRow={selectExportDate}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.qbd.exportDate.label"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE], qbdConfig?.pendingFields)}
            errors={getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => {
                if (!policyID) {
                    return;
                }
                clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE);
            }}
            shouldSingleExecuteRowSelect
        />
    );
}

export default withPolicyConnections(DynamicQuickbooksDesktopExportDateSelectPage);
