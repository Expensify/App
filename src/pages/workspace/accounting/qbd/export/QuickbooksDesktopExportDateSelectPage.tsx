import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
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
    value: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_DATE>;
};
function QuickbooksDesktopExportDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const exportDate = qbdConfig?.export?.exportDate;

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

    const {canUseNewDotQBD} = usePermissions();

    const selectExportDate = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportDate) {
                QuickbooksDesktop.updateQuickbooksDesktopExportDate(policyID, row.value, exportDate);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT.getRoute(policyID));
        },
        [policyID, exportDate],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksDesktopExportDateSelectPage.displayName}
            sections={[{data}]}
            listItem={RadioListItem}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbd.exportDate.description')}</Text>}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID))}
            onSelectRow={selectExportDate}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.qbd.exportDate.label"
            shouldBeBlocked={!canUseNewDotQBD} // TODO: remove it once the QBD beta is done
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE], qbdConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE)}
            shouldSingleExecuteRowSelect
        />
    );
}

QuickbooksDesktopExportDateSelectPage.displayName = 'QuickbooksDesktopExportDateSelectPage';

export default withPolicyConnections(QuickbooksDesktopExportDateSelectPage);
