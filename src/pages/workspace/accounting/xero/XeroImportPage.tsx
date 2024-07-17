import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentXeroOrganizationName} from '@libs/PolicyUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import {getTrackingCategories} from '@userActions/connections/ConnectToXero';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '-1';
    const {importCustomers, importTaxRates, importTrackingCategories, pendingFields, errorFields} = policy?.connections?.xero?.config ?? {};

    const currentXeroOrganizationName = useMemo(() => getCurrentXeroOrganizationName(policy ?? undefined), [policy]);

    const sections = useMemo(
        () => [
            {
                description: translate('workspace.accounting.accounts'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS.getRoute(policyID)),
                title: translate('workspace.accounting.importAsCategory'),
                hasError: PolicyUtils.areSettingsInErrorFields([CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES], errorFields),
                pendingAction: pendingFields?.enableNewCategories,
            },
            {
                description: translate('workspace.xero.trackingCategories'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID)),
                hasError: PolicyUtils.areSettingsInErrorFields(
                    [CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES, ...getTrackingCategories(policy).map((category) => `${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`)],
                    errorFields,
                ),
                title: importTrackingCategories ? translate('workspace.accounting.imported') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importTrackingCategories,
            },
            {
                description: translate('workspace.xero.customers'),
                action: () => {
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_CUSTOMER.getRoute(policyID));
                },
                hasError: PolicyUtils.areSettingsInErrorFields([CONST.XERO_CONFIG.IMPORT_CUSTOMERS], errorFields),
                title: importCustomers ? translate('workspace.accounting.importTypes.TAG') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importCustomers,
            },
            {
                description: translate('workspace.accounting.taxes'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TAXES.getRoute(policyID)),
                hasError: PolicyUtils.areSettingsInErrorFields([CONST.XERO_CONFIG.IMPORT_TAX_RATES], errorFields),
                title: importTaxRates ? translate('workspace.accounting.imported') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importTaxRates,
            },
        ],
        [
            translate,
            errorFields,
            pendingFields?.enableNewCategories,
            pendingFields?.importTrackingCategories,
            pendingFields?.importCustomers,
            pendingFields?.importTaxRates,
            importTrackingCategories,
            importCustomers,
            importTaxRates,
            policyID,
            policy,
        ],
    );

    return (
        <ConnectionLayout
            displayName={XeroImportPage.displayName}
            headerTitle="workspace.accounting.import"
            headerSubtitle={currentXeroOrganizationName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.importDescription')}</Text>

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
        </ConnectionLayout>
    );
}

XeroImportPage.displayName = 'PolicyXeroImportPage';

export default withPolicy(XeroImportPage);
