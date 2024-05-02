import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getXeroTenants} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '';
    const {importCustomers, importTaxRates, importTrackingCategories, pendingFields} = policy?.connections?.xero?.config ?? {};

    const tenants = useMemo(() => getXeroTenants(policy ?? undefined), [policy]);
    const currentXeroOrganization = tenants.find((tenant) => tenant.id === policy?.connections?.xero.config.tenantID);

    const sections = useMemo(
        () => [
            {
                description: translate('workspace.accounting.accounts'),
                action: () => {},
                hasError: !!policy?.errors?.enableNewCategories,
                title: translate('workspace.accounting.imported'),
                pendingAction: pendingFields?.enableNewCategories,
            },
            {
                description: translate('workspace.xero.trackingCategories'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TRACK_CATEGORIES.getRoute(policyID)),
                hasError: !!policy?.errors?.importTrackingCategories,
                title: importTrackingCategories ? translate('workspace.accounting.importedAsTags') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importTrackingCategories,
            },
            {
                description: translate('workspace.xero.customers'),
                action: () => {
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_CUSTOMER.getRoute(policyID));
                },
                hasError: !!policy?.errors?.importCustomers,
                title: importCustomers ? translate('workspace.accounting.importedAsTags') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importCustomers,
            },
            {
                description: translate('workspace.accounting.taxes'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TAXES.getRoute(policyID)),
                hasError: !!policy?.errors?.importTaxes,
                title: importTaxRates ? translate('workspace.accounting.imported') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importTaxRates,
            },
        ],
        [
            importCustomers,
            importTaxRates,
            importTrackingCategories,
            pendingFields?.enableNewCategories,
            pendingFields?.importTaxRates,
            pendingFields?.importCustomers,
            pendingFields?.importTrackingCategories,
            policy?.errors?.importTrackingCategories,
            policy?.errors?.enableNewCategories,
            policy?.errors?.importCustomers,
            policy?.errors?.importTaxes,
            translate,
            policyID,
        ],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={XeroImportPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.accounting.import')}
                    subtitle={currentXeroOrganization?.name}
                />
                <ScrollView contentContainerStyle={styles.pb2}>
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
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroImportPage.displayName = 'PolicyXeroImportPage';

export default withPolicy(XeroImportPage);
