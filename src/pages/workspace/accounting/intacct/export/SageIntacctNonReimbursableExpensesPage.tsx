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
import {areSettingsInErrorFields, getSageIntacctNonReimbursableActiveDefaultVendor, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {updateSageIntacctDefaultVendor, updateSageIntacctNonreimbursableExpensesExportDestination} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {getDefaultVendorName} from './utils';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE>;
};

function SageIntacctNonReimbursableExpensesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {data: intacctData, config} = policy?.connections?.intacct ?? {};

    const data: MenuListItem[] = Object.values(CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE).map((expenseType) => ({
        value: expenseType,
        text: translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${expenseType}`),
        keyForList: expenseType,
        isSelected: config?.export.nonReimbursable === expenseType,
    }));

    const selectNonReimbursableExpense = useCallback(
        (row: MenuListItem) => {
            if (row.value === config?.export.nonReimbursable) {
                return;
            }
            updateSageIntacctNonreimbursableExpensesExportDestination(policyID, row.value, config?.export.nonReimbursable);
        },
        [config?.export.nonReimbursable, policyID],
    );

    const defaultVendor = useMemo(() => {
        const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
        const defaultVendorName = getDefaultVendorName(activeDefaultVendor, intacctData?.vendors);

        const defaultVendorSection = {
            description: translate('workspace.sageIntacct.defaultVendor'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR.getRoute(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE.toLowerCase())),
            title: defaultVendorName && defaultVendorName !== '' ? defaultVendorName : translate('workspace.sageIntacct.notConfigured'),
            subscribedSettings: [
                config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                    ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                    : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
            ],
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
    }, [config?.errorFields, config?.export.nonReimbursable, config?.pendingFields, intacctData?.vendors, policy, policyID, translate]);

    const creditCardAccount = useMemo(() => {
        const creditCardAccountSection = {
            description: translate('workspace.sageIntacct.creditCardAccount'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT.getRoute(policyID)),
            title: config?.export.nonReimbursableAccount ? config.export.nonReimbursableAccount : translate('workspace.sageIntacct.notConfigured'),
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT],
        };

        return (
            <OfflineWithFeedback
                key={creditCardAccountSection.description}
                pendingAction={settingsPendingAction(creditCardAccountSection.subscribedSettings, config?.pendingFields)}
            >
                <MenuItemWithTopDescription
                    title={creditCardAccountSection.title}
                    description={creditCardAccountSection.description}
                    shouldShowRightIcon
                    onPress={creditCardAccountSection.action}
                    brickRoadIndicator={areSettingsInErrorFields(creditCardAccountSection.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        );
    }, [config?.errorFields, config?.export.nonReimbursableAccount, config?.pendingFields, policyID, translate]);

    return (
        <ConnectionLayout
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.sageIntacct.nonReimbursableExpenses.description"
            titleStyle={[styles.ph5, styles.pb5]}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctNonReimbursableExpensesPage.displayName}
            policyID={policyID}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            shouldUseScrollView={false}
            shouldIncludeSafeAreaPaddingBottom
        >
            <OfflineWithFeedback
                pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE], config?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE)}
                errorRowStyles={[styles.ph5, styles.pv3]}
                onClose={() => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE)}
                style={[styles.flexGrow1, styles.flexShrink1]}
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink1]}
            >
                <SelectionList
                    onSelectRow={(selection: SelectorType) => selectNonReimbursableExpense(selection as MenuListItem)}
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    showScrollIndicator
                    shouldShowTooltips={false}
                    containerStyle={[styles.flexReset, styles.flexGrow1, styles.flexShrink1, styles.pb0]}
                />
            </OfflineWithFeedback>
            <View style={[styles.flexGrow1, styles.flexShrink1]}>
                {config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL && defaultVendor}
                {config?.export.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE && (
                    <View>
                        {creditCardAccount}
                        <ToggleSettingOptionRow
                            title={translate('workspace.sageIntacct.defaultVendor')}
                            subtitle={translate('workspace.sageIntacct.defaultVendorDescription', false)}
                            shouldPlaceSubtitleBelowSwitch
                            switchAccessibilityLabel={translate('workspace.sageIntacct.defaultVendor')}
                            isActive={!!config?.export.nonReimbursableCreditCardChargeDefaultVendor}
                            onToggle={(enabled) => {
                                const vendor = enabled ? policy?.connections?.intacct?.data?.vendors?.[0].id ?? '' : '';
                                updateSageIntacctDefaultVendor(
                                    policyID,
                                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                                    vendor,
                                    config?.export.nonReimbursableCreditCardChargeDefaultVendor,
                                );
                            }}
                            wrapperStyle={[styles.ph5, styles.pv3]}
                            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR], config?.pendingFields)}
                            errors={ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR)}
                            onCloseError={() => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR)}
                        />
                        {!!config?.export.nonReimbursableCreditCardChargeDefaultVendor && defaultVendor}
                    </View>
                )}
            </View>
        </ConnectionLayout>
    );
}

SageIntacctNonReimbursableExpensesPage.displayName = 'SageIntacctNonReimbursableExpensesPage';

export default withPolicyConnections(SageIntacctNonReimbursableExpensesPage);
