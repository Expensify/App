import {isEmpty} from 'lodash';
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
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.XERO_CONFIG.INVOICE_STATUS>;
};

function XeroPurchaseBillStatusSelectorPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '';
    const styles = useThemeStyles();
    const {billStatus} = policy?.connections?.xero?.config?.export ?? {};
    const invoiceStatus = billStatus?.purchase;

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
            if (isEmpty(billStatus)) {
                return;
            }
            if (row.value !== invoiceStatus) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.EXPORT, {billStatus: {...billStatus, purchase: row.value}});
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR.getRoute(policyID));
        },
        [billStatus, invoiceStatus, policyID],
    );

    return (
        <SelectionScreen
            displayName={XeroPurchaseBillStatusSelectorPage.displayName}
            title="workspace.xero.invoiceStatus.label"
            headerContent={headerContent}
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectPurchaseBillStatus(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        />
    );
}

XeroPurchaseBillStatusSelectorPage.displayName = 'XeroPurchaseBillStatusSelectorPage';

export default withPolicyConnections(XeroPurchaseBillStatusSelectorPage);
