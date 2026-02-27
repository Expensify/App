import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BaseWidgetItem from '@components/BaseWidgetItem';
import WidgetContainer from '@components/WidgetContainer';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {accountIDSelector} from '@src/selectors/Session';
import todosReportCountsSelector, {EMPTY_TODOS_SINGLE_REPORT_IDS, todosSingleReportIDsSelector} from '@src/selectors/Todos';
import EmptyState from './EmptyState';
import ForYouSkeleton from './ForYouSkeleton';

function ForYouSection() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [reportCounts] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosReportCountsSelector});
    const [singleReportIDs = EMPTY_TODOS_SINGLE_REPORT_IDS] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosSingleReportIDsSelector});

    const icons = useMemoizedLazyExpensifyIcons(['MoneyBag', 'Send', 'ThumbsUp', 'Export']);

    const submitCount = reportCounts?.[CONST.SEARCH.SEARCH_KEYS.SUBMIT] ?? 0;
    const approveCount = reportCounts?.[CONST.SEARCH.SEARCH_KEYS.APPROVE] ?? 0;
    const payCount = reportCounts?.[CONST.SEARCH.SEARCH_KEYS.PAY] ?? 0;
    const exportCount = reportCounts?.[CONST.SEARCH.SEARCH_KEYS.EXPORT] ?? 0;

    const hasAnyTodos = submitCount > 0 || approveCount > 0 || payCount > 0 || exportCount > 0;

    const createNavigationHandler = useCallback(
        (action: string, queryParams: Record<string, unknown>, reportID?: string) => () => {
            if (reportID) {
                if (shouldUseNarrowLayout) {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                } else {
                    Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID}));
                }
                return;
            }

            Navigation.navigate(
                ROUTES.SEARCH_ROOT.getRoute({
                    query: buildQueryStringFromFilterFormValues({
                        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                        action,
                        ...queryParams,
                    }),
                }),
            );
        },
        [shouldUseNarrowLayout],
    );

    const todoItems = useMemo(
        () =>
            [
                {
                    key: 'submit',
                    count: submitCount,
                    icon: icons.Send,
                    translationKey: 'homePage.forYouSection.submit' as const,
                    handler: createNavigationHandler(CONST.SEARCH.ACTION_FILTERS.SUBMIT, {from: [`${accountID}`]}, singleReportIDs[CONST.SEARCH.SEARCH_KEYS.SUBMIT]),
                },
                {
                    key: 'approve',
                    count: approveCount,
                    icon: icons.ThumbsUp,
                    translationKey: 'homePage.forYouSection.approve' as const,
                    handler: createNavigationHandler(CONST.SEARCH.ACTION_FILTERS.APPROVE, {to: [`${accountID}`]}, singleReportIDs[CONST.SEARCH.SEARCH_KEYS.APPROVE]),
                },
                {
                    key: 'pay',
                    count: payCount,
                    icon: icons.MoneyBag,
                    translationKey: 'homePage.forYouSection.pay' as const,
                    handler: createNavigationHandler(
                        CONST.SEARCH.ACTION_FILTERS.PAY,
                        {reimbursable: CONST.SEARCH.BOOLEAN.YES, payer: accountID?.toString()},
                        singleReportIDs[CONST.SEARCH.SEARCH_KEYS.PAY],
                    ),
                },
                {
                    key: 'export',
                    count: exportCount,
                    icon: icons.Export,
                    translationKey: 'homePage.forYouSection.export' as const,
                    handler: createNavigationHandler(
                        CONST.SEARCH.ACTION_FILTERS.EXPORT,
                        {exporter: [`${accountID}`], exportedOn: CONST.SEARCH.DATE_PRESETS.NEVER},
                        singleReportIDs[CONST.SEARCH.SEARCH_KEYS.EXPORT],
                    ),
                },
            ].filter((item) => item.count > 0),
        [accountID, approveCount, createNavigationHandler, exportCount, icons.Export, icons.MoneyBag, icons.Send, icons.ThumbsUp, payCount, singleReportIDs, submitCount],
    );

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
                    buttonProps={{success: true}}
                />
            ))}
        </View>
    );

    const renderContent = () => {
        if (isLoadingApp || isLoadingReportData || reportCounts === undefined) {
            return <ForYouSkeleton />;
        }

        return hasAnyTodos ? renderTodoItems() : <EmptyState />;
    };

    return <WidgetContainer title={translate('homePage.forYou')}>{renderContent()}</WidgetContainer>;
}

export default ForYouSection;
