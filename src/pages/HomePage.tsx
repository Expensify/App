import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {accountIDSelector} from '@src/selectors/Session';

function HomePage() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: accountIDSelector});
    const shouldDisplayLHB = !shouldUseNarrowLayout;

    const handleGoToSearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
                    from: [`${accountID}`],
                }),
            }),
        );
    };

    const handleGoToApproveSearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
                    to: [`${accountID}`],
                }),
            }),
        );
    };

    const handleGoToPaySearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.PAY,
                    reimbursable: CONST.SEARCH.BOOLEAN.YES,
                    payer: accountID?.toString(),
                }),
            }),
        );
    };

    const handleGoToExportSearch = () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.EXPORT,
                    exporter: [`${accountID}`],
                    exportedOn: CONST.SEARCH.DATE_PRESETS.NEVER,
                }),
            }),
        );
    };

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="HomePage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={
                shouldUseNarrowLayout && (
                    <NavigationTabBar
                        selectedTab={NAVIGATION_TABS.HOME}
                        shouldShowFloatingButtons
                    />
                )
            }
        >
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <Button
                    text="Go to submitted expense reports"
                    onPress={handleGoToSearch}
                />
                <View style={styles.mt3}>
                    <Button
                        text="Go to expense reports to approve"
                        onPress={handleGoToApproveSearch}
                    />
                </View>
                <View style={styles.mt3}>
                    <Button
                        text="Go to expense reports to pay"
                        onPress={handleGoToPaySearch}
                    />
                </View>
                <View style={styles.mt3}>
                    <Button
                        text="Go to expense reports to export"
                        onPress={handleGoToExportSearch}
                    />
                </View>
            </View>
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        </ScreenWrapper>
    );
}

export default HomePage;
