import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasAccessToAccountingFeatures} from '@libs/WorkspacesSettingsUtils';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function QuickbooksImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {canUseAccountingIntegrations} = usePermissions();
    const quickbooksOnlineConfigTitles = {
        DEFAULT: translate('workspace.qbo.imported'),
        true: translate('workspace.qbo.imported'),
        false: translate('workspace.qbo.notImported'),
        NONE: translate('workspace.qbo.notImported'),
        TAG: translate('workspace.qbo.importedAsTags'),
        REPORT_FIELD: translate('workspace.qbo.importedAsReportFields'),
    };
    const hasAccess = hasAccessToAccountingFeatures(policy, canUseAccountingIntegrations);
    const policyID = policy?.id ?? '';
    const {syncClasses, syncCustomers, syncLocations, syncTaxes, enableNewCategories, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};

    const sections = [
        {
            description: translate('workspace.qbo.accounts'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_CHART_OF_ACCOUNTS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.enableNewCategories),
            title: enableNewCategories,
            pendingAction: pendingFields?.enableNewCategories,
        },
        {
            description: translate('workspace.qbo.classes'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_CLASSES.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncClasses),
            title: syncClasses,
            pendingAction: pendingFields?.syncClasses,
        },
        {
            description: translate('workspace.qbo.customers'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_CUSTOMERS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncCustomers),
            title: syncCustomers,
            pendingAction: pendingFields?.syncCustomers,
        },
        {
            description: translate('workspace.qbo.locations'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_LOCATIONS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncLocations),
            title: syncLocations,
            pendingAction: pendingFields?.syncLocations,
        },
        {
            description: translate('workspace.qbo.taxes'),
            action: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKSONLINE_TAXES.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncTaxes),
            title: syncTaxes,
            pendingAction: pendingFields?.syncTaxes,
        },
    ];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksImportPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.dismissModal}
                onLinkPress={Navigation.resetToHome}
                shouldShow={!hasAccess}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                shouldForceFullScreen
            >
                <HeaderWithBackButton title={translate('workspace.qbo.import')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.importDescription')}</Text>
                    {sections.map((section) => (
                        <OfflineWithFeedback
                            key={section.description}
                            pendingAction={section.pendingAction}
                        >
                            <MenuItemWithTopDescription
                                title={quickbooksOnlineConfigTitles[`${section.title ?? false}`]}
                                description={section.description}
                                shouldShowRightIcon
                                onPress={section.action}
                                brickRoadIndicator={section.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                        </OfflineWithFeedback>
                    ))}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

QuickbooksImportPage.displayName = 'PolicyQuickbooksImportPage';

export default withPolicy(QuickbooksImportPage);
