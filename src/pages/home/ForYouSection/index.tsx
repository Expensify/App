import BaseWidgetItem from '@components/BaseWidgetItem';
import WidgetContainer from '@components/WidgetContainer';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodoCounts from '@hooks/useTodoCounts';

import {startHomeTodoReview} from '@libs/actions/HomeTodoReview';
import {setHasSeenForYouTodo} from '@libs/actions/Todos';
import {getHomeTodoReportRoute} from '@libs/HomeTodoReviewUtils';
import Navigation from '@libs/Navigation/Navigation';

import useTimeSensitiveItems from '@pages/home/TimeSensitiveSection/useTimeSensitiveItems';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import type {HomeTodoSearchKey} from '@src/types/onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

import ConciergePromptBox from './ConciergePromptBox';
import ForYouBody from './ForYouBody';
import shouldHideForYouSection from './shouldHideForYouSection';
import useClearHomeTodoReviewOnFocus from './useClearHomeTodoReviewOnFocus';
import useReviewDomainAdminRequests from './useReviewDomainAdminRequests';
import useReviewFlaggedExpenses from './useReviewFlaggedExpenses';

type ForYouSectionProps = {
    /** Whether the app load skeleton is showing. */
    isInitialLoad: boolean;

    /** Concierge "+" menu visibility, owned by HomePage so it survives this section's remount on breakpoint change. */
    isConciergeMenuVisible: boolean;
    setIsConciergeMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

function ForYouSection({isInitialLoad, isConciergeMenuVisible, setIsConciergeMenuVisible}: ForYouSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const {counts: reportCounts, reportIDs: todoReportIDs} = useTodoCounts(isFocused);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboarding);
    const [hasSeenForYouTodo = false] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_FOR_YOU_TODO);
    const {count: flaggedExpensesCount, reviewExpenses} = useReviewFlaggedExpenses();
    const {count: domainAdminRequestsCount, reviewDomainAdminRequests} = useReviewDomainAdminRequests();
    const timeSensitiveItems = useTimeSensitiveItems();
    useClearHomeTodoReviewOnFocus();

    const icons = useMemoizedLazyExpensifyIcons(['ReceiptSearch', 'MoneyBag', 'Send', 'ThumbsUp', 'Export', 'UserShield']);

    const submitCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.SUBMIT];
    const approveCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.APPROVE];
    const payCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.PAY];
    const exportCount = reportCounts[CONST.SEARCH.SEARCH_KEYS.EXPORT];

    // Opens the row's first report and hands the rest to the report screen, which pages through them and moves on
    // to the next one after each action, so the user can finish the row without leaving Home.
    const createBeginReportTodoHandler = (searchKey: HomeTodoSearchKey) => () => {
        const reportIDs = todoReportIDs[searchKey];
        const firstReportID = reportIDs.at(0);
        if (!firstReportID) {
            return;
        }
        startHomeTodoReview(searchKey, reportIDs);
        Navigation.navigate(getHomeTodoReportRoute(firstReportID, shouldUseNarrowLayout));
    };

    const todoItems = [
        {
            key: 'reviewExpenses',
            sentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM.REVIEW_EXPENSES,
            buttonSentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM_BUTTON.REVIEW_EXPENSES,
            count: flaggedExpensesCount,
            icon: icons.ReceiptSearch,
            translationKey: 'homePage.forYouSection.reviewExpenses' as const,
            handler: reviewExpenses,
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        },
        {
            key: 'submit',
            sentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM.SUBMIT,
            buttonSentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM_BUTTON.SUBMIT,
            count: submitCount,
            icon: icons.Send,
            translationKey: 'homePage.forYouSection.submit' as const,
            handler: createBeginReportTodoHandler(CONST.SEARCH.SEARCH_KEYS.SUBMIT),
        },
        {
            key: 'approve',
            sentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM.APPROVE,
            buttonSentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM_BUTTON.APPROVE,
            count: approveCount,
            icon: icons.ThumbsUp,
            translationKey: 'homePage.forYouSection.approve' as const,
            handler: createBeginReportTodoHandler(CONST.SEARCH.SEARCH_KEYS.APPROVE),
        },
        {
            key: 'pay',
            sentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM.PAY,
            buttonSentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM_BUTTON.PAY,
            count: payCount,
            icon: icons.MoneyBag,
            translationKey: 'homePage.forYouSection.pay' as const,
            handler: createBeginReportTodoHandler(CONST.SEARCH.SEARCH_KEYS.PAY),
        },
        {
            key: 'export',
            sentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM.EXPORT,
            buttonSentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM_BUTTON.EXPORT,
            count: exportCount,
            icon: icons.Export,
            translationKey: 'homePage.forYouSection.export' as const,
            handler: createBeginReportTodoHandler(CONST.SEARCH.SEARCH_KEYS.EXPORT),
        },
        {
            key: 'reviewDomainAdminRequests',
            sentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM.REVIEW_DOMAIN_ADMIN_REQUESTS,
            buttonSentryLabel: CONST.SENTRY_LABEL.HOME_PAGE.FOR_YOU_ITEM_BUTTON.REVIEW_DOMAIN_ADMIN_REQUESTS,
            count: domainAdminRequestsCount,
            icon: icons.UserShield,
            translationKey: 'homePage.forYouSection.reviewDomainAdminRequests' as const,
            handler: reviewDomainAdminRequests,
        },
    ].filter((item) => item.count > 0);

    const hasAnyTodos = todoItems.length > 0;

    const forYouRows: React.ReactNode[] = todoItems.map(({key, count, icon, translationKey, handler, buttonVariant, sentryLabel, buttonSentryLabel}) => (
        <BaseWidgetItem
            key={key}
            sentryLabel={sentryLabel}
            buttonSentryLabel={buttonSentryLabel}
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
            <ForYouBody
                isInitialLoad={isInitialLoad}
                shouldShowSkeleton={shouldShowSkeletonBody}
                timeSensitiveRows={timeSensitiveItems}
                todoRows={visibleForYouRows}
                shouldShowEmptyState={showEmptyState}
            />
        </WidgetContainer>
    );
}

export default ForYouSection;
