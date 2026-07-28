import BaseWidgetItem from '@components/BaseWidgetItem';
import WidgetContainer from '@components/WidgetContainer';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodoCounts from '@hooks/useTodoCounts';

import {setHasSeenForYouTodo} from '@libs/actions/Todos';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import {accountIDSelector} from '@src/selectors/Session';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

import EmptyState from './EmptyState';
import ForYouSkeleton from './ForYouSkeleton';
import shouldHideForYouSection from './shouldHideForYouSection';
import useReviewFlaggedExpenses from './useReviewFlaggedExpenses';

function ForYouSection() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    // HAS_LOADED_APP flips to true once the first OpenApp completes and persists across reconnects.
    // Gating the skeleton on it prevents the section from flashing skeleton on every foreground/reconnect
    // when IS_LOADING_REPORT_DATA is optimistically set to true by ReconnectApp.
    const [hasLoadedApp = false] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const isFocused = useIsFocused();
    const {counts: reportCounts, singleReportIDs} = useTodoCounts(isFocused);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboarding);
    // The onboarding NVP defaults to "completed" before it loads, so only trust it once the value is present.
    const isOnboardingStatusKnown = onboarding !== undefined;
    // Old/migrated accounts have an empty onboarding NVP; a non-empty record marks a NewDot-onboarded (new) user.
    const isNewDotOnboardedUser = !isEmptyObject(onboarding);
    const [hasSeenForYouTodo = false] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_FOR_YOU_TODO);
    const {count: flaggedExpensesCount, reviewExpenses} = useReviewFlaggedExpenses();

    const icons = useMemoizedLazyExpensifyIcons(['ReceiptSearch', 'MoneyBag', 'Send', 'ThumbsUp', 'Export']);

    const submitCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.SUBMIT];
    const approveCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.APPROVE];
    const payCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.PAY];
    const exportCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.EXPORT];

    const hasAnyTodos = flaggedExpensesCount > 0 || submitCount > 0 || approveCount > 0 || payCount > 0 || exportCount > 0;

    const navigateToReport = useCallback(
        (reportID: string) => {
            if (shouldUseNarrowLayout) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME));
                return;
            }
            Navigation.navigate(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME}));
        },
        [shouldUseNarrowLayout],
    );

    const createNavigationHandler = useCallback(
        (action: string, queryParams: Record<string, unknown>, reportID?: string) => () => {
            if (reportID) {
                navigateToReport(reportID);
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
        [navigateToReport],
    );

    const todoItems = useMemo(
        () =>
            [
                {
                    key: 'reviewExpenses',
                    count: flaggedExpensesCount,
                    icon: icons.ReceiptSearch,
                    iconBackgroundColor: colors.tangerine100,
                    iconFill: colors.tangerine500,
                    translationKey: 'homePage.forYouSection.reviewExpenses' as const,
                    handler: reviewExpenses,
                    buttonProps: {danger: true} as const,
                },
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
        [
            accountID,
            approveCount,
            createNavigationHandler,
            reviewExpenses,
            exportCount,
            flaggedExpensesCount,
            icons.Export,
            icons.MoneyBag,
            icons.ReceiptSearch,
            icons.Send,
            icons.ThumbsUp,
            payCount,
            singleReportIDs,
            submitCount,
        ],
    );

    const renderTodoItems = () => (
        <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
            {todoItems.map(({key, count, icon, iconBackgroundColor, iconFill, translationKey, handler, buttonProps}) => (
                <BaseWidgetItem
                    key={key}
                    icon={icon}
                    iconBackgroundColor={iconBackgroundColor ?? theme.widgetIconBG}
                    iconFill={iconFill ?? theme.widgetIconFill}
                    title={translate(translationKey, {count})}
                    ctaText={translate('homePage.forYouSection.begin')}
                    onCtaPress={handler}
                    buttonProps={buttonProps ?? {success: true}}
                />
            ))}
        </View>
    );

    const isInitialLoad = !hasLoadedApp && (isLoadingApp || isLoadingReportData);

    // Persist a one-time flag the first time a to-do appears so the section stays visible even when later empty.
    useEffect(() => {
        if (isInitialLoad || !hasAnyTodos || hasSeenForYouTodo) {
            return;
        }
        setHasSeenForYouTodo();
    }, [isInitialLoad, hasAnyTodos, hasSeenForYouTodo]);

    const renderContent = () => {
        if (isInitialLoad) {
            const reasonAttributes: SkeletonSpanReasonAttributes = {
                context: 'ForYouSection.ForYouSkeleton',
                isLoadingApp,
                isLoadingReportData,
                hasLoadedApp,
            };
            return <ForYouSkeleton reasonAttributes={reasonAttributes} />;
        }

        return hasAnyTodos ? renderTodoItems() : <EmptyState />;
    };

    if (
        shouldHideForYouSection({
            isInitialLoad,
            hasAnyTodos,
            hasSeenTodo: hasSeenForYouTodo,
            firstDayFreeTrial,
            cutoffDate: CONST.HOME.FOR_YOU_NEW_USER_CUTOFF_DATE,
            isOnboardingCompleted,
            isOnboardingStatusKnown,
            isNewDotOnboardedUser,
        })
    ) {
        return null;
    }

    return <WidgetContainer title={translate('homePage.forYou')}>{renderContent()}</WidgetContainer>;
}

export default ForYouSection;
