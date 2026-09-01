import BaseWidgetItem from '@components/BaseWidgetItem';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';

import {useAppLoadSkeletonState, useShouldWaitForAppLoad} from '@hooks/useInFlightRequests';
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

import TimeSensitiveGroup from '@pages/home/TimeSensitiveSection/TimeSensitiveGroup';
import useTimeSensitiveItems from '@pages/home/TimeSensitiveSection/useTimeSensitiveItems';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import {accountIDSelector} from '@src/selectors/Session';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

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
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const {shouldShowSkeleton: isInitialLoad} = useAppLoadSkeletonState({isLoadingReportData});
    const shouldWaitForAppLoad = useShouldWaitForAppLoad();
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
                    iconBackgroundColor: colors.tangerine100,
                    iconFill: colors.tangerine500,
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

    const renderTodoItems = () => (
        <View style={styles.getForYouSectionContainerStyle(shouldUseNarrowLayout)}>
            {todoItems.map(({key, count, icon, iconBackgroundColor, iconFill, translationKey, handler, buttonVariant}) => (
                <BaseWidgetItem
                    key={key}
                    icon={icon}
                    iconBackgroundColor={iconBackgroundColor ?? theme.widgetIconBG}
                    iconFill={iconFill ?? theme.widgetIconFill}
                    title={translate(translationKey, {count})}
                    ctaText={translate('homePage.forYouSection.begin')}
                    onCtaPress={handler}
                    buttonVariant={buttonVariant ?? CONST.BUTTON_VARIANT.SUCCESS}
                />
            ))}
        </View>
    );

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

    // One shimmer block stands in for the whole body during app load, rather than each group deferring on its own,
    // so no heading or row appears mid-load as its data lands.
    const renderBody = () => {
        if (isInitialLoad) {
            return shouldShowSkeletonBody ? <ForYouSkeleton /> : null;
        }

        return (
            <>
                <TimeSensitiveGroup items={timeSensitiveItems} />
                {!hideForYou && (
                    <>
                        <View style={styles.getForYouSectionHeadingStyle(shouldUseNarrowLayout)}>
                            <Text style={styles.getWidgetContainerTitleStyle(theme.text)}>{translate('homePage.forYou')}</Text>
                        </View>
                        {hasAnyTodos ? renderTodoItems() : <EmptyState />}
                    </>
                )}
            </>
        );
    };

    // Nothing but the Concierge box renders when the body is empty, which is the only case that needs the tighter
    // bottom padding.
    const hasBodyContent = isInitialLoad ? shouldShowSkeletonBody : timeSensitiveItems.length > 0 || !hideForYou;

    // The Concierge copy renders correctly from cache, so it must not stay blanked for as long as the device is
    // offline. The body shimmer has nothing cached to fall back on.
    const isConciergeCopyLoading = isInitialLoad && shouldWaitForAppLoad;

    // The card always renders so the Concierge input stays on the home page.
    return (
        <WidgetContainer
            containerStyles={hasBodyContent ? undefined : [styles.pb3]}
            titleContent={
                <ConciergePromptBox
                    isMenuVisible={isConciergeMenuVisible}
                    setIsMenuVisible={setIsConciergeMenuVisible}
                    isCopyLoading={isConciergeCopyLoading}
                />
            }
        >
            {renderBody()}
        </WidgetContainer>
    );
}

export default ForYouSection;
