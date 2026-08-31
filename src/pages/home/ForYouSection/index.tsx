import BaseWidgetItem from '@components/BaseWidgetItem';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';

import {useAppLoadSkeletonState} from '@hooks/useInFlightRequests';
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
    const isFocused = useIsFocused();
    const {counts: reportCounts, singleReportIDs} = useTodoCounts(isFocused);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isOnboardingCompleted = hasCompletedGuidedSetupFlowSelector(onboarding);
    // The onboarding NVP defaults to "completed" before it loads, so only trust it once the value is present.
    const isOnboardingStatusKnown = onboarding !== undefined;
    const [hasSeenForYouTodo = false] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_FOR_YOU_TODO);
    const {count: flaggedExpensesCount, reviewExpenses} = useReviewFlaggedExpenses();
    // "Time sensitive" now lives inside this card as a group above the "For you" todos (chat input stays on top).
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

    const renderContent = () => {
        if (isInitialLoad) {
            return <ForYouSkeleton />;
        }

        return hasAnyTodos ? renderTodoItems() : <EmptyState />;
    };

    const hideForYou = shouldHideForYouSection({
        isInitialLoad,
        hasAnyTodos,
        hasSeenTodo: hasSeenForYouTodo,
        firstDayFreeTrial,
        cutoffDate: CONST.HOME.FOR_YOU_NEW_USER_CUTOFF_DATE,
        isOnboardingCompleted,
        isOnboardingStatusKnown,
    });

    const willOnlyShowConciergePromptBox = timeSensitiveItems.length === 0 && hideForYou;

    // The card always renders so the Concierge input stays on the home page. `hideForYou` only gates the "For you"
    // heading and todos or empty-state below it. When hidden with no time-sensitive content, the card is just the box.
    return (
        <WidgetContainer
            containerStyles={willOnlyShowConciergePromptBox ? [styles.pb3] : undefined}
            titleContent={
                <ConciergePromptBox
                    isMenuVisible={isConciergeMenuVisible}
                    setIsMenuVisible={setIsConciergeMenuVisible}
                />
            }
        >
            <TimeSensitiveGroup items={timeSensitiveItems} />
            {!hideForYou && (
                <>
                    <View style={[shouldUseNarrowLayout ? styles.ph5 : styles.ph8, styles.mt4, styles.mb2]}>
                        <Text style={styles.getWidgetContainerTitleStyle(theme.text)}>{translate('homePage.forYou')}</Text>
                    </View>
                    {renderContent()}
                </>
            )}
        </WidgetContainer>
    );
}

export default ForYouSection;
