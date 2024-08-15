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
import * as ErrorUtils from '@libs/ErrorUtils';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {changeMappingsValueFromDefaultToTag, updateSageIntacctDefaultVendor, updateSageIntacctReimbursableExpensesExportDestination} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SageIntacctDataElementWithValue} from '@src/types/onyx/Policy';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>;
};

function getDefaultVendorName(defaultVendor?: string, vendors?: SageIntacctDataElementWithValue[]): string | undefined {
    return (vendors ?? []).find((vendor) => vendor.id === defaultVendor)?.value ?? defaultVendor;
}

function SageIntacctReimbursableExpensesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};
    const {reimbursable, reimbursableExpenseReportDefaultVendor} = policy?.connections?.intacct?.config?.export ?? {};

    const data: MenuListItem[] = Object.values(CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE).map((expenseType) => ({
        value: expenseType,
        text: translate(`workspace.sageIntacct.reimbursableExpenses.values.${expenseType}`),
        keyForList: expenseType,
        isSelected: reimbursable === expenseType,
    }));

    const selectReimbursableDestination = useCallback(
        (row: MenuListItem) => {
            if (row.value !== reimbursable) {
                updateSageIntacctReimbursableExpensesExportDestination(policyID, row.value, reimbursable);
            }
            if (row.value === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL) {
                // Employee default mapping value is not allowed when expense type is VENDOR_BILL, so we have to change mapping value to Tag
                changeMappingsValueFromDefaultToTag(policyID, config?.mappings);
                Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID));
            }
        },
        [reimbursable, policyID, config?.mappings],
    );

    const defaultVendor = useMemo(() => {
        const defaultVendorName = getDefaultVendorName(reimbursableExpenseReportDefaultVendor, intacctData?.vendors);
        const defaultVendorSection = {
            description: translate('workspace.sageIntacct.defaultVendor'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE)),
            title: defaultVendorName && defaultVendorName !== '' ? defaultVendorName : translate('workspace.sageIntacct.notConfigured'),
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR],
        };

        return (
            <OfflineWithFeedback
                key={defaultVendorSection.description}
                pendingAction={settingsPendingAction(defaultVendorSection.subscribedSettings, config?.pendingFields)}
            >
                <MenuItemWithTopDescription
                    title={defaultVendorSection.title}
                    description={defaultVendorSection.description}
                    shouldShowRightIcon
                    onPress={defaultVendorSection.action}
                    brickRoadIndicator={areSettingsInErrorFields(defaultVendorSection.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        );
    }, [config?.errorFields, config?.pendingFields, intacctData?.vendors, policyID, reimbursableExpenseReportDefaultVendor, translate]);

    return (
        <ConnectionLayout
            headerTitle="workspace.accounting.exportOutOfPocket"
            title="workspace.sageIntacct.reimbursableExpenses.description"
            titleStyle={[styles.ph5, styles.pb5]}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctReimbursableExpensesPage.displayName}
            policyID={policyID}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            shouldUseScrollView={false}
            shouldIncludeSafeAreaPaddingBottom
        >
            <OfflineWithFeedback
                pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE], config?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE)}
                errorRowStyles={[styles.ph5, styles.pv3]}
                onClose={() => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE)}
                style={[styles.flexGrow1, styles.flexShrink1]}
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink1]}
            >
                <SelectionList
                    onSelectRow={(selection: SelectorType) => selectReimbursableDestination(selection as MenuListItem)}
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    showScrollIndicator
                    shouldShowTooltips={false}
                    containerStyle={[styles.flexReset, styles.flexGrow1, styles.flexShrink1, styles.pb0]}
                />
            </OfflineWithFeedback>
            {reimbursable === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT && (
                <View style={[styles.flexGrow1, styles.flexShrink1]}>
                    <ToggleSettingOptionRow
                        title={translate('workspace.sageIntacct.defaultVendor')}
                        subtitle={translate('workspace.sageIntacct.defaultVendorDescription', true)}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.sageIntacct.defaultVendor')}
                        isActive={!!reimbursableExpenseReportDefaultVendor}
                        onToggle={(enabled) => {
                            const vendor = enabled ? policy?.connections?.intacct?.data?.vendors?.[0].id ?? '' : '';
                            updateSageIntacctDefaultVendor(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR, vendor, reimbursableExpenseReportDefaultVendor);
                        }}
                        pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR], config?.pendingFields)}
                        errors={ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR)}
                        wrapperStyle={[styles.ph5, styles.pv3]}
                        onCloseError={() => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR)}
                    />
                    {!!reimbursableExpenseReportDefaultVendor && defaultVendor}
                </View>
            )}
        </ConnectionLayout>
    );
}

SageIntacctReimbursableExpensesPage.displayName = 'SageIntacctReimbursableExpensesPage';

export default withPolicyConnections(SageIntacctReimbursableExpensesPage);
