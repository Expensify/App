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
import {clearXeroErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {updateXeroExportBillDate} from '@userActions/connections/Xero';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.XERO_EXPORT_DATE>;
};

function XeroPurchaseBillDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {config} = policy?.connections?.xero ?? {};
    const data: MenuListItem[] = Object.values(CONST.XERO_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.xero.exportDate.values.${dateType}.label`),
        alternateText: translate(`workspace.xero.exportDate.values.${dateType}.description`),
        keyForList: dateType,
        isSelected: config?.export?.billDate === dateType,
    }));
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT>>();
    const backTo = route.params?.backTo;

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.exportDate.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectExportDate = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.export?.billDate && policyID) {
                updateXeroExportBillDate(policyID, row.value, config?.export?.billDate);
            }
            goBack();
        },
        [config?.export?.billDate, policyID, goBack],
    );

    return (
        <SelectionScreen
            displayName="XeroPurchaseBillDateSelectPage"
            title="workspace.xero.exportDate.label"
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportDate(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.BILL_DATE], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.BILL_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.BILL_DATE)}
        />
    );
}

export default withPolicyConnections(XeroPurchaseBillDateSelectPage);
