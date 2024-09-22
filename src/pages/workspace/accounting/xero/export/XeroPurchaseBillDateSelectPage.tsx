import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {updateXeroExportBillDate} from '@userActions/connections/Xero';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.XERO_EXPORT_DATE>;
};

function XeroPurchaseBillDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {config} = policy?.connections?.xero ?? {};
    const data: MenuListItem[] = Object.values(CONST.XERO_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.xero.exportDate.values.${dateType}.label`),
        alternateText: translate(`workspace.xero.exportDate.values.${dateType}.description`),
        keyForList: dateType,
        isSelected: config?.export?.billDate === dateType,
    }));

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
            if (row.value !== config?.export?.billDate) {
                updateXeroExportBillDate(policyID, row.value, config?.export?.billDate);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT.getRoute(policyID));
        },
        [config?.export?.billDate, policyID],
    );

    return (
        <SelectionScreen
            displayName={XeroPurchaseBillDateSelectPage.displayName}
            title="workspace.xero.exportDate.label"
            headerContent={headerContent}
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportDate(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            pendingAction={PolicyUtils.settingsPendingAction([CONST.XERO_CONFIG.BILL_DATE], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.BILL_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.BILL_DATE)}
        />
    );
}

XeroPurchaseBillDateSelectPage.displayName = 'XeroPurchaseBillDateSelectPage';

export default withPolicyConnections(XeroPurchaseBillDateSelectPage);
