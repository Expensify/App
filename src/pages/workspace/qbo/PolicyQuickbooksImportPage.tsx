import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function PolicyQuickbooksImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const quickbooksOnlineConfigTitles = {
        DEFAULT: translate('workspace.qbo.imported'),
        true: translate('workspace.qbo.imported'),
        false: translate('workspace.qbo.notImported'),
        NONE: translate('workspace.qbo.notImported'),
        TAG: translate('workspace.qbo.importedAsTags'),
        REPORT_FIELD: translate('workspace.qbo.importedAsReportFields'),
    };
    const policyID = policy?.id ?? '';
    const {syncClasses, syncCustomers, syncLocations, syncTaxes, syncAccounts} = policy?.connections?.quickbooksOnline?.config ?? {};

    const sections = [
        {
            description: translate('workspace.qbo.accounts'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_CHART_OF_ACCOUNTS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncAccounts),
            title: syncAccounts,
        },
        {
            description: translate('workspace.qbo.classes'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_CLASSES.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncClasses),
            title: syncClasses,
        },
        {
            description: translate('workspace.qbo.customers'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_CUSTOMER.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncCustomers),
            title: syncCustomers,
        },
        {
            description: translate('workspace.qbo.locations'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_LOCATIONS.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncLocations),
            title: syncLocations,
        },
        {
            description: translate('workspace.qbo.taxes'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_TAXES.getRoute(policyID)),
            hasError: Boolean(policy?.errors?.syncTaxes),
            title: syncTaxes,
        },
    ];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={PolicyQuickbooksImportPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.qbo.import')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={styles.pb2}>
                <Text style={[styles.pl5, styles.pb5]}>{translate('workspace.qbo.importDescription')}</Text>
                {sections.map((section) => (
                    <OfflineWithFeedback>
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
        </ScreenWrapper>
    );
}

PolicyQuickbooksImportPage.displayName = 'PolicyQuickbooksImportPage';

export default withPolicy(PolicyQuickbooksImportPage);
