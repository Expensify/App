import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import type {SelectorType} from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateNetSuiteInvoiceItemPreference} from '@libs/actions/connections/NetSuiteCommands';
import {clearNetSuiteErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>;
};

function DynamicNetSuiteInvoiceItemPreferenceSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const config = policy?.connections?.netsuite?.options.config;
    const selectionListRef = useRef<SelectionListHandle<ListItem>>(null);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.path);

    const {items} = policy?.connections?.netsuite?.options.data ?? {};
    const selectedItem = useMemo(() => items?.find(({id}) => id === config?.invoiceItem), [items, config?.invoiceItem]);

    const selectedValue = Object.values(CONST.NETSUITE_INVOICE_ITEM_PREFERENCE).find((value) => value === config?.invoiceItemPreference) ?? CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE;

    const [draftPreference, setDraftPreference] = useState<ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>>();
    const currentPreference = draftPreference ?? selectedValue;

    const options: MenuListItem[] = useMemo(
        () =>
            Object.values(CONST.NETSUITE_INVOICE_ITEM_PREFERENCE).map((postingPreference) => ({
                value: postingPreference,
                text: translate(`workspace.netsuite.invoiceItem.values.${postingPreference}.label`),
                keyForList: postingPreference,
                isSelected: currentPreference === postingPreference,
            })),
        [currentPreference, translate],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const savePreference = useCallback(() => {
        if (currentPreference !== config?.invoiceItemPreference && policyID) {
            updateNetSuiteInvoiceItemPreference(policyID, currentPreference, config?.invoiceItemPreference);
        }
        // Selecting CREATE completes the flow, so we return to the previous screen. SELECT reveals the invoice-item sub-menu, so we stay.
        if (currentPreference === CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE) {
            goBack();
        }
    }, [currentPreference, config?.invoiceItemPreference, policyID, goBack]);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.save'),
            onConfirm: savePreference,
            isDisabled: currentPreference === selectedValue,
        }),
        [savePreference, translate, currentPreference, selectedValue],
    );

    // Update focused index when the current preference changes (after an error reverts the selection)
    useEffect(() => {
        const selectedIndex = options.findIndex((option) => option.isSelected);
        if (selectedIndex !== -1 && selectionListRef.current) {
            selectionListRef.current?.updateFocusedIndex(selectedIndex);
        }
    }, [currentPreference, options]);

    return (
        <ConnectionLayout
            headerTitle="workspace.netsuite.invoiceItem.label"
            title={`workspace.netsuite.invoiceItem.values.${config?.invoiceItemPreference ?? CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE}.description`}
            titleStyle={[styles.ph5, styles.pb5]}
            onBackButtonPress={goBack}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="DynamicNetSuiteInvoiceItemPreferenceSelectPage"
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
                        setDraftPreference((selection as MenuListItem).value);
                    }}
                    ListItem={SingleSelectListItem}
                    confirmButtonOptions={confirmButtonOptions}
                    showScrollIndicator
                    shouldUpdateFocusedIndex
                    initiallyFocusedItemKey={options.find((mode) => mode.isSelected)?.keyForList}
                    style={{containerStyle: [styles.pb0]}}
                    addBottomSafeAreaPadding
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
                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT.path));
                            }}
                            brickRoadIndicator={areSettingsInErrorFields([CONST.NETSUITE_CONFIG.INVOICE_ITEM], config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                </View>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicNetSuiteInvoiceItemPreferenceSelectPage);
