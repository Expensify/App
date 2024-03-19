import React, {useCallback} from 'react';
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

const NAVIGATION_KEYS = {
    ACCOUNTS: 'accounts',
    CLASSES: 'classes',
    CUSTOMERS: 'customers',
    LOCATIONS: 'locations',
    TAXES: 'taxes',
};

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
    const {syncClasses, syncCustomers, syncLocations, syncTaxes, syncAccounts} = policy?.connections?.quickbooksOnline?.config ?? {};

    const onPressConfigOption = useCallback(
        (option: string) => {
            const policyID = policy?.id ?? '';
            switch (option) {
                case NAVIGATION_KEYS.ACCOUNTS:
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_CHART_OF_ACCOUNTS.getRoute(policyID));
                    break;
                case NAVIGATION_KEYS.CLASSES:
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_CLASSES.getRoute(policyID));
                    break;
                case NAVIGATION_KEYS.CUSTOMERS:
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_CUSTOMER.getRoute(policyID));
                    break;
                case NAVIGATION_KEYS.LOCATIONS:
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_LOCATIONS.getRoute(policyID));
                    break;
                case NAVIGATION_KEYS.TAXES:
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKSONLINE_TAXES.getRoute(policyID));
                    break;
                default:
                    break;
            }
        },
        [policy?.id],
    );

    const sections = [
        {
            description: translate('workspace.qbo.accounts'),
            navigationKey: NAVIGATION_KEYS.ACCOUNTS,
            errorIndicator: !!policy?.errors?.syncAccounts,
            title: syncAccounts,
        },
        {
            description: translate('workspace.qbo.classes'),
            navigationKey: NAVIGATION_KEYS.CLASSES,
            errorIndicator: !!policy?.errors?.syncClasses,
            title: syncClasses,
        },
        {
            description: translate('workspace.qbo.customers'),
            navigationKey: NAVIGATION_KEYS.CUSTOMERS,
            errorIndicator: !!policy?.errors?.syncCustomers,
            title: syncCustomers,
        },
        {
            description: translate('workspace.qbo.locations'),
            navigationKey: NAVIGATION_KEYS.LOCATIONS,
            errorIndicator: !!policy?.errors?.syncLocations,
            title: syncLocations,
        },
        {
            description: translate('workspace.qbo.taxes'),
            navigationKey: NAVIGATION_KEYS.TAXES,
            errorIndicator: !!policy?.errors?.syncTaxes,
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
                            title={quickbooksOnlineConfigTitles[`${section.title ?? 'NONE'}`]}
                            description={section.description}
                            shouldShowRightIcon
                            onPress={() => onPressConfigOption(section.navigationKey)}
                            brickRoadIndicator={section.errorIndicator ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

PolicyQuickbooksImportPage.displayName = 'PolicyQuickbooksImportPage';

export default withPolicy(PolicyQuickbooksImportPage);
