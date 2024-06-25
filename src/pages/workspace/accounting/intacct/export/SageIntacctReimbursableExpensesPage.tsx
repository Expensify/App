import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {updateSageIntacctDefaultVendor, updateSageIntacctExportReimbursableExpense} from '@userActions/connections/SageIntacct';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SageIntacctDataElementWithValue} from '@src/types/onyx/Policy';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE>;
};

function getDefaultVendorName(defaultVendor: string, vendors: SageIntacctDataElementWithValue[]): string {
    return vendors.find((vendor) => vendor.id === defaultVendor)?.value ?? defaultVendor;
}

function SageIntacctReimbursableExpensesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};
    const {reimbursable, reimbursableExpenseReportDefaultVendor} = policy?.connections?.intacct?.config?.export ?? {};

    const [isSwitchOn, setIsSwitchOn] = useState(!!reimbursableExpenseReportDefaultVendor);

    const data: MenuListItem[] = Object.values(CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE).map((expenseType) => ({
        value: expenseType,
        text: translate(`workspace.sageIntacct.reimbursableExpenses.values.${expenseType}`),
        keyForList: expenseType,
        isSelected: reimbursable === expenseType,
    }));

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.sageIntacct.reimbursableExpenses.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectExportDate = useCallback(
        (row: MenuListItem) => {
            if (row.value !== reimbursable) {
                updateSageIntacctExportReimbursableExpense(policyID, row.value);
            }
            if (row.value === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL) {
                Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID));
            }
        },
        [reimbursable, policyID],
    );

    const defaultVendorSection = {
        description: translate('workspace.sageIntacct.defaultVendor'),
        action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, 'reimbursable')),
        title: reimbursableExpenseReportDefaultVendor
            ? getDefaultVendorName(reimbursableExpenseReportDefaultVendor, intacctData?.vendors ?? [])
            : translate('workspace.sageIntacct.notConfigured'),
        hasError: !!config?.errorFields?.exporter,
        pendingAction: config?.pendingFields?.export,
    };

    const defaultVendor = (
        <OfflineWithFeedback
            key={defaultVendorSection.description}
            pendingAction={defaultVendorSection.pendingAction}
        >
            <MenuItemWithTopDescription
                title={defaultVendorSection.title}
                description={defaultVendorSection.description}
                shouldShowRightIcon
                onPress={defaultVendorSection.action}
                brickRoadIndicator={defaultVendorSection.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            />
        </OfflineWithFeedback>
    );

    return (
        <View>
            <SelectionScreen
                displayName={SageIntacctReimbursableExpensesPage.displayName}
                title="workspace.sageIntacct.reimbursableExpenses.label"
                headerContent={headerContent}
                sections={[{data}]}
                listItem={RadioListItem}
                onSelectRow={(selection: SelectorType) => selectExportDate(selection as MenuListItem)}
                initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                policyID={policyID}
                accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID))}
                connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            />
            {reimbursable === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT && (
                <View>
                    <ToggleSettingOptionRow
                        title={translate('workspace.sageIntacct.defaultVendor')}
                        subtitle={translate('workspace.sageIntacct.defaultVendorDescription', true)}
                        shouldPlaceSubtitleBelowSwitch
                        switchAccessibilityLabel={translate('workspace.sageIntacct.defaultVendor')}
                        isActive={isSwitchOn}
                        onToggle={() => {
                            updateSageIntacctDefaultVendor(policyID, {reimbursableExpenseReportDefaultVendor: null});
                            setIsSwitchOn(!isSwitchOn);
                        }}
                        wrapperStyle={[styles.ph5, styles.pv3]}
                    />
                    {isSwitchOn && defaultVendor}
                </View>
            )}
        </View>
    );
}

SageIntacctReimbursableExpensesPage.displayName = 'PolicySageIntacctReimbursableExpensesPage';

export default withPolicyConnections(SageIntacctReimbursableExpensesPage);
