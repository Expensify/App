import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import Icon from '@components/Icon';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryString} from '@components/Search/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {CAROUSEL_SOURCE, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import {TOP_EXPENSES_LIMIT} from '@pages/Insights/insightsQueries';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {fullPolicySnapshotLastModifiedByPolicyIDSelector} from '@selectors/Policy';
import React from 'react';
import {View} from 'react-native';

import type {TopExpensesState} from './useInsightsTopExpenses';

import {TOP_EXPENSES_STATE} from './useInsightsTopExpenses';

type InsightsTopExpensesProps = {
    /** The largest expenses, largest first */
    expenses: TransactionListItemType[];

    state: TopExpensesState;

    /** Called by the retry button when the expenses failed to load */
    onRetry: () => void;

    /** Spend table query that View all opens */
    viewAllQuery: SearchQueryString;
};

/** Lists the largest expenses behind the clicked item, each opening in the RHP. */
function InsightsTopExpenses({expenses, state, onRetry, viewAllQuery}: InsightsTopExpensesProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpRight']);
    const {markReportRHPWidth} = useWideRHPActions();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [fullPolicySnapshotLastModifiedByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT, {selector: fullPolicySnapshotLastModifiedByPolicyIDSelector});
    const isEmpty = state === TOP_EXPENSES_STATE.READY && expenses.length === 0;

    const toDescriptor = (expense: TransactionListItemType): TransactionThreadNavigationDescriptor => ({
        reportID: expense.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID,
        transaction: expense,
        reportAction: expense.reportAction,
        report: expense.report,
    });

    const openExpense = (expense: TransactionListItemType) => {
        const reportID = getReportIDToOpenForExpense(toDescriptor(expense), {
            introSelected,
            conciergeChat,
            isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
            hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
            currentUserEmail,
            currentUserAccountID,
            personalDetails,
            fullPolicySnapshotLastModifiedByPolicyID,
        });
        const descriptors = Object.fromEntries(expenses.map((sibling) => [sibling.transactionID, toDescriptor(sibling)]));
        setActiveTransactionIDs(
            expenses.map((sibling) => sibling.transactionID),
            {source: CAROUSEL_SOURCE.insightsTopExpenses, descriptors},
        ).then(() => {
            markReportRHPWidth(reportID, 'wide');
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: Navigation.getActiveRoute(), anchorTransactionID: expense.transactionID}));
        });
    };

    if (state === TOP_EXPENSES_STATE.STALE) {
        return (
            <FullPageErrorView
                shouldShow
                title={translate('search.searchResults.staleResults.title')}
                subtitle={translate('search.searchResults.staleResults.subtitle')}
                illustration="ChartSync"
                illustrationWidth={variables.iconSizeUltraLarge}
                illustrationHeight={variables.iconSizeUltraLarge}
                buttonTranslationKey="search.searchResults.staleResults.buttonText"
                onButtonPress={onRetry}
            />
        );
    }
    if (state === TOP_EXPENSES_STATE.ERROR) {
        return (
            <FullPageErrorView
                shouldShow
                title={translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout})}
                subtitle={translate('errorPage.subtitle')}
                buttonTranslationKey="common.tryAgain"
                onButtonPress={onRetry}
            />
        );
    }

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.overflowHidden]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.p4, styles.borderBottom]}>
                <Text
                    variant="label"
                    style={styles.textSupporting}
                >
                    {translate('insightsPage.topExpenses')}
                </Text>
                {(state === TOP_EXPENSES_STATE.LOADING || expenses.length > 0) && (
                    <PressableWithoutFeedback
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: viewAllQuery}))}
                        accessibilityRole={CONST.ROLE.LINK}
                        accessibilityLabel={translate('insightsPage.viewAll')}
                        sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_VIEW_ALL_TOP_EXPENSES}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                    >
                        <Text
                            variant="label"
                            style={styles.link}
                        >
                            {translate('insightsPage.viewAll')}
                        </Text>
                        <Icon
                            src={icons.ArrowUpRight}
                            fill={theme.link}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                        />
                    </PressableWithoutFeedback>
                )}
            </View>
            {state === TOP_EXPENSES_STATE.LOADING && (
                <SearchRowSkeleton
                    shouldAnimate
                    fixedNumItems={TOP_EXPENSES_LIMIT}
                    shouldUseNarrowLayout
                />
            )}
            {state === TOP_EXPENSES_STATE.OFFLINE && <ChartOfflineState />}
            {isEmpty && (
                <Text
                    variant="label"
                    style={[styles.textSupporting, styles.p4]}
                >
                    {translate('insightsPage.noExpensesInRange')}
                </Text>
            )}
            {expenses.map((item, index) => (
                <PressableWithFeedback
                    key={item.keyForList}
                    onPress={() => openExpense(item)}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    accessibilityLabel={item.formattedMerchant ?? item.merchant}
                    sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_TOP_EXPENSE}
                    wrapperStyle={styles.w100}
                    hoverStyle={styles.hoveredComponentBG}
                    style={[styles.ph4, styles.pv3, index < expenses.length - 1 && styles.borderBottom]}
                >
                    <TransactionItemRow
                        transactionItem={item}
                        report={item.report}
                        policy={item.policy}
                        shouldUseNarrowLayout
                        isSelected={false}
                        shouldShowTooltip={false}
                        shouldShowCheckbox={false}
                        shouldShowErrors={false}
                        dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        style={[styles.p0, styles.noBorderRadius]}
                    />
                </PressableWithFeedback>
            ))}
        </View>
    );
}

export default InsightsTopExpenses;
