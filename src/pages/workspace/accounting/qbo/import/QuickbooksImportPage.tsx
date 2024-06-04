import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncClasses, syncCustomers, syncLocations, syncTax, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};

    const sections = [
        {
            description: translate('workspace.accounting.accounts'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.enableNewCategories),
            title: translate('workspace.accounting.importAsCategory'),
            pendingAction: pendingFields?.enableNewCategories,
        },
        {
            description: translate('workspace.qbo.classes'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncClasses),
            title: translate(`workspace.accounting.importTypes.${syncClasses ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            pendingAction: pendingFields?.syncClasses,
        },
        {
            description: translate('workspace.qbo.customers'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncCustomers),
            title: translate(`workspace.accounting.importTypes.${syncCustomers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            pendingAction: pendingFields?.syncCustomers,
        },
        {
            description: translate('workspace.qbo.locations'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncLocations),
            title: translate(`workspace.accounting.importTypes.${syncLocations ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            pendingAction: pendingFields?.syncLocations,
        },
    ];

    if (policy?.connections?.quickbooksOnline?.data?.country !== CONST.COUNTRY.US) {
        sections.push({
            description: translate('workspace.accounting.taxes'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncTax),
            title: translate(syncTax ? 'workspace.accounting.imported' : 'workspace.accounting.notImported'),
            pendingAction: pendingFields?.syncTax,
        });
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={QuickbooksImportPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.import')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.importDescription')}</Text>
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

QuickbooksImportPage.displayName = 'PolicyQuickbooksImportPage';

export default withPolicyConnections(QuickbooksImportPage);
