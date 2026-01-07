import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteExportDate} from '@libs/actions/connections/NetSuiteCommands';
import {clearNetSuiteErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>;
};

function NetSuiteDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_DATE_SELECT>>();
    const backTo = route.params?.backTo;
    const config = policy?.connections?.netsuite?.options.config;
    const selectedValue = Object.values(CONST.NETSUITE_EXPORT_DATE).find((value) => value === config?.exportDate) ?? CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE;
    const data: MenuListItem[] = Object.values(CONST.NETSUITE_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.netsuite.exportDate.values.${dateType}.label`),
        alternateText: translate(`workspace.netsuite.exportDate.values.${dateType}.description`),
        keyForList: dateType,
        isSelected: selectedValue === dateType,
    }));

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.exportDate.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)));
    }, [backTo, policyID]);

    const selectExportDate = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.exportDate && policyID) {
                updateNetSuiteExportDate(policyID, row.value, config?.exportDate);
            }
            goBack();
        },
        [config?.exportDate, policyID, goBack],
    );

    return (
        <SelectionScreen
            displayName="NetSuiteDateSelectPage"
            title="workspace.netsuite.exportDate.label"
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportDate(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.EXPORT_DATE], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.EXPORT_DATE)}
        />
    );
}

export default withPolicyConnections(NetSuiteDateSelectPage);
