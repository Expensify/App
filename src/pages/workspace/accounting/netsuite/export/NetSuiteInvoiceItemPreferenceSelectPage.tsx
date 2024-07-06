import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>;
};

function NetSuiteInvoiceItemPreferenceSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const config = policy?.connections?.netsuite.options.config;

    const {items} = policy?.connections?.netsuite.options.data ?? {};
    const selectedItem = useMemo(() => (items ?? []).find((item) => item.id === config?.invoiceItem), [items, config?.invoiceItem]);

    const data: MenuListItem[] = Object.values(CONST.NETSUITE_INVOICE_ITEM_PREFERENCE).map((postingPreference) => ({
        value: postingPreference,
        text: translate(`workspace.netsuite.invoiceItem.values.${postingPreference}.label`),
        keyForList: postingPreference,
        isSelected: config?.invoiceItemPreference === postingPreference,
    }));

    const selectInvoicePreference = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.invoiceItemPreference) {
                Connections.updateNetSuiteInvoiceItemPreference(policyID, row.value, config?.invoiceItemPreference);
            }
            if (row.value === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE) {
                Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID));
            }
        },
        [config?.invoiceItemPreference, policyID],
    );

    const headerContent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb2, styles.textNormal]}>
                    {translate(`workspace.netsuite.invoiceItem.values.${config?.invoiceItemPreference ?? CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE}.description`)}
                </Text>
            </View>
        ),
        [styles.pb2, styles.ph5, styles.textNormal, translate, config?.invoiceItemPreference],
    );

    return (
        <SelectionScreen
            displayName={NetSuiteInvoiceItemPreferenceSelectPage.displayName}
            title="workspace.netsuite.invoiceItem.label"
            sections={[{data}]}
            listItem={RadioListItem}
            headerContent={headerContent}
            onSelectRow={(selection: SelectorType) => selectInvoicePreference(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID))}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            listFooterContent={
                config?.invoiceItemPreference === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT ? (
                    <OfflineWithFeedback
                        key={translate('workspace.netsuite.invoiceItem.label')}
                        pendingAction={config?.pendingFields?.invoiceItem}
                        errors={ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.INVOICE_ITEM)}
                        errorRowStyles={[styles.ph5]}
                        onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM)}
                    >
                        <MenuItemWithTopDescription
                            description={translate('workspace.netsuite.invoiceItem.label')}
                            title={selectedItem ? selectedItem.name : undefined}
                            interactive
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT.getRoute(policyID))}
                            brickRoadIndicator={config?.errorFields?.invoiceItem ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                ) : null
            }
        />
    );
}

NetSuiteInvoiceItemPreferenceSelectPage.displayName = 'NetSuiteInvoiceItemPreferenceSelectPage';

export default withPolicyConnections(NetSuiteInvoiceItemPreferenceSelectPage);
