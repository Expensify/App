import BaseWidgetItem from '@components/BaseWidgetItem';
import WidgetContainer from '@components/WidgetContainer';

import {useAppLoadSkeletonVisibility} from '@hooks/useInFlightRequests';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodoCounts from '@hooks/useTodoCounts';

import {setHasSeenForYouTodo} from '@libs/actions/Todos';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';

import HomeTaskGroup from '@pages/home/HomeTaskGroup';
import useTimeSensitiveItems from '@pages/home/TimeSensitiveSection/useTimeSensitiveItems';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import {accountIDSelector} from '@src/selectors/Session';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';

import ConciergePromptBox from './ConciergePromptBox';
import EmptyState from './EmptyState';
import ForYouSkeleton from './ForYouSkeleton';
import shouldHideForYouSection from './shouldHideForYouSection';
import useReviewFlaggedExpenses from './useReviewFlaggedExpenses';

type ForYouSectionProps = {
    /** Concierge "+" menu visibility, owned by HomePage so it survives this section's remount on breakpoint change. */
    isConciergeMenuVisible: boolean;
    setIsConciergeMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

function ForYouSection({isConciergeMenuVisible, setIsConciergeMenuVisible}: ForYouSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const isInitialLoad = useAppLoadSkeletonVisibility({isLoadingReportData});
    const isFocused = useIsFocused();
    const {counts: reportCounts, singleReportIDs} = useTodoCounts(isFocused);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboarding);
    const [hasSeenForYouTodo = false] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_FOR_YOU_TODO);
    const {count: flaggedExpensesCount, reviewExpenses} = useReviewFlaggedExpenses();
    const timeSensitiveItems = useTimeSensitiveItems();

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
                    translationKey: 'homePage.forYouSection.reviewExpenses' as const,
                    handler: reviewExpenses,
                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
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

    const forYouRows: React.ReactNode[] = todoItems.map(({key, count, icon, translationKey, handler, buttonVariant}) => (
        <BaseWidgetItem
            key={key}
            icon={icon}
            title={translate(translationKey, {count})}
            ctaText={translate('homePage.forYouSection.begin')}
            onCtaPress={handler}
            buttonVariant={buttonVariant ?? CONST.BUTTON_VARIANT.SUCCESS}
        />
    ));

    // Persist a one-time flag the first time a to-do appears so the section stays visible even when later empty.
    useEffect(() => {
        if (isInitialLoad || !hasAnyTodos || hasSeenForYouTodo) {
            return;
        }
        setHasSeenForYouTodo();
    }, [isInitialLoad, hasAnyTodos, hasSeenForYouTodo]);

    const hideForYou = shouldHideForYouSection({
        hasAnyTodos,
        hasSeenTodo: hasSeenForYouTodo,
        firstDayFreeTrial,
        cutoffDate: CONST.HOME.FOR_YOU_NEW_USER_CUTOFF_DATE,
        isOnboardingCompleted,
    });

    // A user known to be mid-onboarding has no body once loaded, so a shimmer would appear and then collapse
    // (see the flashing empty state in issue #81846). Every other case gets the skeleton, including one whose
    // onboarding NVP has not landed: the rest of the hide rules read NVPs that arrive with app load, and waiting
    // on them leaves the card a bare Concierge box for the whole load on a cold cache.
    const shouldShowSkeletonBody = isOnboardingCompleted !== false;

    const visibleForYouRows = hideForYou ? [] : forYouRows;

    // The empty state stands in for the to-dos only when both groups are empty.
    const showEmptyState = !hideForYou && visibleForYouRows.length === 0 && timeSensitiveItems.length === 0;

    // One shimmer block stands in for the whole body during app load, rather than each group deferring on its own,
    // so no heading or row appears mid-load as its data lands.
    const renderBody = () => {
        if (isInitialLoad) {
            return shouldShowSkeletonBody ? <ForYouSkeleton /> : null;
        }

        return (
            <>
                <HomeTaskGroup
                    title={translate('homePage.timeSensitiveSection.title')}
                    rows={timeSensitiveItems}
                />
                <HomeTaskGroup
                    title={translate('homePage.toDos')}
                    rows={visibleForYouRows}
                    reducedTopGap={timeSensitiveItems.length > 0}
                >
                    {showEmptyState ? <EmptyState /> : null}
                </HomeTaskGroup>
            </>
        );
    };

    // Nothing but the Concierge box renders when the body is empty, which is the only case that needs the tighter
    // bottom padding.
    const hasBodyContent = isInitialLoad ? shouldShowSkeletonBody : timeSensitiveItems.length > 0 || visibleForYouRows.length > 0 || showEmptyState;

    // The card always renders so the Concierge input stays on the home page.
    return (
        <WidgetContainer
            containerStyles={hasBodyContent ? undefined : [styles.pb3]}
            titleContent={
                <ConciergePromptBox
                    isMenuVisible={isConciergeMenuVisible}
                    setIsMenuVisible={setIsConciergeMenuVisible}
                    isCopyLoading={isInitialLoad}
                />
            }
        >
            {renderBody()}
        </WidgetContainer>
    );
}

export default ForYouSection;
