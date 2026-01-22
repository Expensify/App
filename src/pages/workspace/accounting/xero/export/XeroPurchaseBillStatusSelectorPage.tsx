import {useRoute} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
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
import {updateXeroExportBillStatus} from '@userActions/connections/Xero';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.XERO_CONFIG.INVOICE_STATUS>;
};

function XeroPurchaseBillStatusSelectorPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {config} = policy?.connections?.xero ?? {};
    const invoiceStatus = config?.export?.billStatus?.purchase;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR>>();
    const backTo = route.params?.backTo;

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);

    const data: MenuListItem[] = Object.values(CONST.XERO_CONFIG.INVOICE_STATUS).map((status) => ({
        value: status,
        text: translate(`workspace.xero.invoiceStatus.values.${status}`),
        keyForList: status,
        isSelected: invoiceStatus === status,
    }));

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.invoiceStatus.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectPurchaseBillStatus = useCallback(
        (row: MenuListItem) => {
            if (isEmpty(config?.export?.billStatus)) {
                return;
            }
            if (row.value !== invoiceStatus && policyID) {
                updateXeroExportBillStatus(
                    policyID,
                    {
                        ...config?.export?.billStatus,
                        purchase: row.value,
                    },
                    config?.export?.billStatus,
                );
            }
            goBack();
        },
        [config?.export?.billStatus, invoiceStatus, policyID, goBack],
    );

    return (
        <SelectionScreen
            displayName="XeroPurchaseBillStatusSelectorPage"
            title="workspace.xero.invoiceStatus.label"
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectPurchaseBillStatus(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.BILL_STATUS], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.BILL_STATUS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.BILL_STATUS)}
        />
    );
}

export default withPolicyConnections(XeroPurchaseBillStatusSelectorPage);
