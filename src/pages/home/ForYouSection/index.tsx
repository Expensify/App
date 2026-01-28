import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import BaseWidgetItem from '@components/BaseWidgetItem';
import * as Expensicons from '@components/Icon/Expensicons';
import WidgetContainer from '@components/WidgetContainer';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodos from '@hooks/useTodos';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {accountIDSelector} from '@src/selectors/Session';
import EmptyState from './EmptyState';

function ForYouSection() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: accountIDSelector});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {reportCounts} = useTodos();
    
    const submitCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.SUBMIT];
    const approveCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.APPROVE];
    const payCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.PAY];
    const exportCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.EXPORT];

    const hasAnyTodos = submitCount > 0 || approveCount > 0 || payCount > 0 || exportCount > 0;

    const handleSubmitPress = () => {
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

    const handleApprovePress = () => {
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

    const handlePayPress = () => {
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

    const handleExportPress = () => {
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

    const renderTodoItems = () => (
        <View style={[styles.flexColumn, styles.mb8, styles.mh8, styles.pv3, styles.gap6]}>
            {submitCount > 0 && (
                <BaseWidgetItem
                    icon={Expensicons.Send}
                    iconBackgroundColor={theme.widgetIconBG}
                    iconFill={theme.widgetIconFill}
                    title={translate('homePage.forYouSection.submit', {count: submitCount})}
                    ctaText={translate('homePage.forYouSection.begin')}
                    onCtaPress={handleSubmitPress}
                />
            )}
            {approveCount > 0 && (
                <BaseWidgetItem
                    icon={Expensicons.ThumbsUp}
                    iconBackgroundColor={theme.widgetIconBG}
                    iconFill={theme.widgetIconFill}
                    title={translate('homePage.forYouSection.approve', {count: approveCount})}
                    ctaText={translate('homePage.forYouSection.begin')}
                    onCtaPress={handleApprovePress}
                />
            )}
            {payCount > 0 && (
                <BaseWidgetItem
                    icon={Expensicons.Cash}
                    iconBackgroundColor={theme.widgetIconBG}
                    iconFill={theme.widgetIconFill}
                    title={translate('homePage.forYouSection.pay', {count: payCount})}
                    ctaText={translate('homePage.forYouSection.begin')}
                    onCtaPress={handlePayPress}
                />
            )}
            {exportCount > 0 && (
                <BaseWidgetItem
                    icon={Expensicons.Export}
                    iconBackgroundColor={theme.widgetIconBG}
                    iconFill={theme.widgetIconFill}
                    title={translate('homePage.forYouSection.export', {count: exportCount})}
                    ctaText={translate('homePage.forYouSection.begin')}
                    onCtaPress={handleExportPress}
                />
            )}
        </View>
    );

    const renderContent = () => {
        if (isLoadingApp) {
            return (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.pv6, styles.mb8]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            );
        }

        return hasAnyTodos ? renderTodoItems() : <EmptyState />;
    };

    return (
        <WidgetContainer title={translate('homePage.forYou')}>
            {renderContent()}
        </WidgetContainer>
    );
}

export default ForYouSection;
