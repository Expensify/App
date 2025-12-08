import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineExportDate} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CardListItem = ListItem & {
    value: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_DATE>;
};
function QuickbooksExportDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT>>();
    const backTo = route.params.backTo;
    const data: CardListItem[] = Object.values(CONST.QUICKBOOKS_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.qbo.exportDate.values.${dateType}.label`),
        alternateText: translate(`workspace.qbo.exportDate.values.${dateType}.description`),
        keyForList: dateType,
        isSelected: qboConfig?.exportDate === dateType,
    }));

    const exportDate = useMemo(() => qboConfig?.exportDate, [qboConfig?.exportDate]);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID));
    }, [policyID, backTo]);

    const selectExportDate = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportDate && policyID) {
                updateQuickbooksOnlineExportDate(policyID, row.value, exportDate);
            }
            goBack();
        },
        [policyID, exportDate, goBack],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksExportDateSelectPage.displayName}
            sections={[{data}]}
            listItem={RadioListItem}
            headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportDate.description')}</Text>}
            onBackButtonPress={goBack}
            onSelectRow={selectExportDate}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            title="workspace.qbo.exportDate.label"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.EXPORT_DATE], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.EXPORT_DATE)}
            shouldSingleExecuteRowSelect
        />
    );
}

QuickbooksExportDateSelectPage.displayName = 'QuickbooksExportDateSelectPage';

export default withPolicyConnections(QuickbooksExportDateSelectPage);
