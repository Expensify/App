import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import BaseWidgetItem from '@components/BaseWidgetItem';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: accountIDSelector});
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const {reportCounts} = useTodos();
    const icons = useMemoizedLazyExpensifyIcons(['Cash', 'Send', 'ThumbsUp', 'Export']);

    const submitCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.SUBMIT];
    const approveCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.APPROVE];
    const payCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.PAY];
    const exportCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.EXPORT];

    const hasAnyTodos = submitCount > 0 || approveCount > 0 || payCount > 0 || exportCount > 0;

    const createNavigationHandler = (action: string, queryParams: Record<string, unknown>) => () => {
        Navigation.navigate(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action,
                    ...queryParams,
                }),
            }),
        );
    };

    const todoItems = [
        {
            key: 'submit',
            count: submitCount,
            icon: icons.Send,
            translationKey: 'homePage.forYouSection.submit' as const,
            handler: createNavigationHandler(CONST.SEARCH.ACTION_FILTERS.SUBMIT, {from: [`${accountID}`]}),
        },
        {
            key: 'approve',
            count: approveCount,
            icon: icons.ThumbsUp,
            translationKey: 'homePage.forYouSection.approve' as const,
            handler: createNavigationHandler(CONST.SEARCH.ACTION_FILTERS.APPROVE, {to: [`${accountID}`]}),
        },
        {
            key: 'pay',
            count: payCount,
            icon: icons.Cash,
            translationKey: 'homePage.forYouSection.pay' as const,
            handler: createNavigationHandler(CONST.SEARCH.ACTION_FILTERS.PAY, {reimbursable: CONST.SEARCH.BOOLEAN.YES, payer: accountID?.toString()}),
        },
        {
            key: 'export',
            count: exportCount,
            icon: icons.Export,
            translationKey: 'homePage.forYouSection.export' as const,
            handler: createNavigationHandler(CONST.SEARCH.ACTION_FILTERS.EXPORT, {exporter: [`${accountID}`], exportedOn: CONST.SEARCH.DATE_PRESETS.NEVER}),
        },
    ].filter((item) => item.count > 0);

    const renderTodoItems = () => (
        <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
            {todoItems.map(({key, count, icon, translationKey, handler}) => (
                <BaseWidgetItem
                    key={key}
                    icon={icon}
                    iconBackgroundColor={theme.widgetIconBG}
                    iconFill={theme.widgetIconFill}
                    title={translate(translationKey, {count})}
                    ctaText={translate('homePage.forYouSection.begin')}
                    onCtaPress={handler}
                />
            ))}
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

    return <WidgetContainer title={translate('homePage.forYou')}>{renderContent()}</WidgetContainer>;
}

export default ForYouSection;
