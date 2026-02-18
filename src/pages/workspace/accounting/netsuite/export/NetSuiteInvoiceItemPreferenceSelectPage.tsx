import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteInvoiceItemPreference} from '@libs/actions/connections/NetSuiteCommands';
import {clearNetSuiteErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, findSelectedInvoiceItemWithDefaultSelect, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>;
};

function NetSuiteInvoiceItemPreferenceSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const config = policy?.connections?.netsuite.options.config;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT>>();
    const selectionListRef = useRef<SelectionListHandle<ListItem>>(null);

    const {items} = policy?.connections?.netsuite?.options.data ?? {};
    const selectedItem = useMemo(() => findSelectedInvoiceItemWithDefaultSelect(items, config?.invoiceItem), [items, config?.invoiceItem]);

    const selectedValue = Object.values(CONST.NETSUITE_INVOICE_ITEM_PREFERENCE).find((value) => value === config?.invoiceItemPreference) ?? CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE;

    const options: MenuListItem[] = useMemo(
        () =>
            Object.values(CONST.NETSUITE_INVOICE_ITEM_PREFERENCE).map((postingPreference) => ({
                value: postingPreference,
                text: translate(`workspace.netsuite.invoiceItem.values.${postingPreference}.label`),
                keyForList: postingPreference,
                isSelected: selectedValue === postingPreference,
            })),
        [selectedValue, translate],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(route.params.backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)));
    }, [route.params.backTo, policyID]);

    const selectInvoicePreference = useCallback(
        (row: MenuListItem) => {
            if (row.value !== config?.invoiceItemPreference && policyID) {
                updateNetSuiteInvoiceItemPreference(policyID, row.value, config?.invoiceItemPreference);
            }
            if (row.value === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE) {
                goBack();
            }
        },
        [config?.invoiceItemPreference, policyID, goBack],
    );

    // Update focused index when selectedValue changes (after an error reverts the selection)
    useEffect(() => {
        const selectedIndex = options.findIndex((option) => option.isSelected);
        if (selectedIndex !== -1 && selectionListRef.current) {
            selectionListRef.current?.updateFocusedIndex(selectedIndex);
        }
    }, [selectedValue, options]);

    return (
        <ConnectionLayout
            headerTitle="workspace.netsuite.invoiceItem.label"
            title={`workspace.netsuite.invoiceItem.values.${config?.invoiceItemPreference ?? CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE}.description`}
            titleStyle={[styles.ph5, styles.pb5]}
            onBackButtonPress={goBack}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteInvoiceItemPreferenceSelectPage"
            policyID={policyID}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldUseScrollView={false}
        >
            <OfflineWithFeedback
                pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE], config?.pendingFields)}
                errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE)}
                errorRowStyles={[styles.ph5, styles.pv3]}
                onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE)}
                style={[styles.flexGrow1, styles.flexShrink1, styles.minHeight32]}
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink1, styles.minHeight32]}
            >
                <SelectionList
                    ref={selectionListRef}
                    data={options}
                    onSelectRow={(selection: SelectorType) => {
                        selectInvoicePreference(selection as MenuListItem);
                    }}
                    ListItem={RadioListItem}
                    showScrollIndicator
                    shouldUpdateFocusedIndex
                    initiallyFocusedItemKey={options.find((mode) => mode.isSelected)?.keyForList}
                    style={{containerStyle: [styles.pb0]}}
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
                            onPress={() => {
                                if (!policyID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT.getRoute(policyID));
                            }}
                            brickRoadIndicator={areSettingsInErrorFields([CONST.NETSUITE_CONFIG.INVOICE_ITEM], config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                </View>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(NetSuiteInvoiceItemPreferenceSelectPage);
