import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import {areSettingsInErrorFields, findSelectedInvoiceItemWithDefaultSelect, settingsPendingAction} from '@libs/PolicyUtils';
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
    const policyID = policy?.id;
    const config = policy?.connections?.netsuite.options.config;

    const {items} = policy?.connections?.netsuite.options.data ?? {};
    const selectedItem = useMemo(() => findSelectedInvoiceItemWithDefaultSelect(items, config?.invoiceItem), [items, config?.invoiceItem]);

    const selectedValue = Object.values(CONST.NETSUITE_INVOICE_ITEM_PREFERENCE).find((value) => value === config?.invoiceItemPreference) ?? CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE;

    const data: MenuListItem[] = Object.values(CONST.NETSUITE_INVOICE_ITEM_PREFERENCE).map((postingPreference) => ({
        value: postingPreference,
        text: translate(`workspace.netsuite.invoiceItem.values.${postingPreference}.label`),
        keyForList: postingPreference,
        isSelected: selectedValue === postingPreference,
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

    return (
        <ConnectionLayout
            headerTitle="workspace.netsuite.invoiceItem.label"
            title={`workspace.netsuite.invoiceItem.values.${config?.invoiceItemPreference ?? CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE}.description`}
            titleStyle={[styles.ph5, styles.pb5]}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteInvoiceItemPreferenceSelectPage.displayName}
            policyID={policyID}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldUseScrollView={false}
            shouldIncludeSafeAreaPaddingBottom
        >
            <OfflineWithFeedback
                pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE], config?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE)}
                errorRowStyles={[styles.ph5, styles.pv3]}
                onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE)}
                style={[styles.flexGrow1, styles.flexShrink1]}
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink1]}
            >
                <SelectionList
                    onSelectRow={(selection: SelectorType) => selectInvoicePreference(selection as MenuListItem)}
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    showScrollIndicator
                    shouldUpdateFocusedIndex
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                    containerStyle={[styles.flexReset, styles.flexGrow1, styles.flexShrink1, styles.pb0]}
                />
            </OfflineWithFeedback>
            {config?.invoiceItemPreference === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT && (
                <View style={[styles.flexGrow1, styles.flexShrink1]}>
                    <OfflineWithFeedback
                        key={translate('workspace.netsuite.invoiceItem.label')}
                        pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.INVOICE_ITEM], config?.pendingFields)}
                    >
                        <MenuItemWithTopDescription
                            description={translate('workspace.netsuite.invoiceItem.label')}
                            title={selectedItem ? selectedItem.name : undefined}
                            interactive
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT.getRoute(policyID))}
                            brickRoadIndicator={areSettingsInErrorFields([CONST.NETSUITE_CONFIG.INVOICE_ITEM], config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                </View>
            )}
        </ConnectionLayout>
    );
}

NetSuiteInvoiceItemPreferenceSelectPage.displayName = 'NetSuiteInvoiceItemPreferenceSelectPage';

export default withPolicyConnections(NetSuiteInvoiceItemPreferenceSelectPage);
