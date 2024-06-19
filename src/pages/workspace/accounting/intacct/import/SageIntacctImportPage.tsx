import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentXeroOrganizationName} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '-1';
    const {importCustomers, importTaxRates, importTrackingCategories, pendingFields, errorFields} = policy?.connections?.xero?.config ?? {};

    const currentXeroOrganizationName = useMemo(() => getCurrentXeroOrganizationName(policy ?? undefined), [policy]);

    const sections = useMemo(
        () => [
            {
                description: 'Departments',
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS.getRoute(policyID)),
                title: 'Sage Intacct employee default',
                hasError: !!errorFields?.enableNewCategories,
                pendingAction: pendingFields?.enableNewCategories,
            },
            {
                description: 'Classes',
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID)),
                hasError: !!errorFields?.importTrackingCategories,
                pendingAction: pendingFields?.importTrackingCategories,
            },
            {
                description: 'Locations',
                action: () => {
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_CUSTOMER.getRoute(policyID));
                },
                hasError: !!errorFields?.importCustomers,
                title: 'Imported, displayed as tags',
                pendingAction: pendingFields?.importCustomers,
            },
            {
                description: 'Customers',
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TAXES.getRoute(policyID)),
                hasError: !!errorFields?.importTaxRates,
                title: 'Imported, displayed as report fields',
                pendingAction: pendingFields?.importTaxRates,
            },
            {
                description: 'Projects (jobs)',
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TAXES.getRoute(policyID)),
                hasError: !!errorFields?.importTaxRates,
                pendingAction: pendingFields?.importTaxRates,
            },
        ],
        [
            translate,
            errorFields?.enableNewCategories,
            errorFields?.importTrackingCategories,
            errorFields?.importCustomers,
            errorFields?.importTaxRates,
            pendingFields?.enableNewCategories,
            pendingFields?.importTrackingCategories,
            pendingFields?.importCustomers,
            pendingFields?.importTaxRates,
            importTrackingCategories,
            importCustomers,
            importTaxRates,
            policyID,
        ],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctImportPage.displayName}
            headerTitle="workspace.accounting.import"
            headerSubtitle={currentXeroOrganizationName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <ToggleSettingOptionRow
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title="Expense types"
                subtitle="Sage Intacct expense types import into Expensify as categories."
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title="Billable"
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
            />

            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.description}
                    pendingAction={section.pendingAction}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        shouldShowRightIcon
                        onPress={section.action}
                        brickRoadIndicator={section.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}

            <ToggleSettingOptionRow
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title="Tax"
                subtitle="Import purchase tax rate from Sage Intacct."
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
            />
            <OfflineWithFeedback
            // key={section.description}
            // pendingAction={section.pendingAction}
            >
                <MenuItemWithTopDescription
                    description="User-defined dimensions"
                    shouldShowRightIcon
                    onPress={() => {}}
                    // brickRoadIndicator={section.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

SageIntacctImportPage.displayName = 'PolicySageIntacctImportPage';

export default withPolicy(SageIntacctImportPage);
