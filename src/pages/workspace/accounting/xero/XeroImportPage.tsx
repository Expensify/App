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
import {getCurrentXeroOrganizationName} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '';
    const {importCustomers, importTaxRates, importTrackingCategories, pendingFields, errorFields} = policy?.connections?.xero?.config ?? {};

    const currentXeroOrganizationName = useMemo(() => getCurrentXeroOrganizationName(policy ?? undefined), [policy]);

    const sections = useMemo(
        () => [
            {
                description: translate('workspace.accounting.accounts'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS.getRoute(policyID)),
                title: translate('workspace.accounting.importAsCategory'),
                hasError: !!errorFields?.enableNewCategories,
                pendingAction: pendingFields?.enableNewCategories,
            },
            {
                description: translate('workspace.xero.trackingCategories'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID)),
                hasError: !!errorFields?.importTrackingCategories,
                title: importTrackingCategories ? translate('workspace.accounting.importTypes.TAG') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importTrackingCategories,
            },
            {
                description: translate('workspace.xero.customers'),
                action: () => {
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_CUSTOMER.getRoute(policyID));
                },
                hasError: !!errorFields?.importCustomers,
                title: importCustomers ? translate('workspace.accounting.importTypes.TAG') : translate('workspace.xero.notImported'),
                pendingAction: pendingFields?.importCustomers,
            },
            {
                description: translate('workspace.accounting.taxes'),
                action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TAXES.getRoute(policyID)),
                hasError: !!errorFields?.importTaxRates,
                title: importTaxRates ? translate('workspace.accounting.imported') : translate('workspace.xero.notImported'),
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
                    subtitle={currentXeroOrganizationName}
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
