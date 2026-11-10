import Icon from '@components/Icon';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryString} from '@components/Search/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {CAROUSEL_SOURCE, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionDisplayAmount} from '@libs/ReportUtils';
import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';
import {getCreated, getCurrency, isScanning} from '@libs/TransactionUtils';

import {TOP_EXPENSES_LIMIT} from '@pages/Insights/insightsQueries';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {fullPolicySnapshotLastModifiedByPolicyIDSelector} from '@selectors/Policy';
import React from 'react';
import {View} from 'react-native';

import InsightsDetailsSectionError from './InsightsDetailsSectionError';
import {INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';
import useInsightsTopExpenses from './useInsightsTopExpenses';

type InsightsTopExpensesProps = {
    /** Spend table query whose largest expenses the section lists */
    query: SearchQueryString;
};

/** Lists the largest expenses behind the clicked item, each opening in the RHP. */
function InsightsTopExpenses({query}: InsightsTopExpensesProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {expenses, queryJSON, state, retry} = useInsightsTopExpenses(query);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpRight']);
    const {markReportRHPWidth} = useWideRHPActions();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [fullPolicySnapshotLastModifiedByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT, {selector: fullPolicySnapshotLastModifiedByPolicyIDSelector});
    const isEmpty = state === INSIGHTS_DETAILS_SECTION_STATE.READY && expenses.length === 0;

    const getRowAccessibilityLabel = (expense: TransactionListItemType) => {
        const amount = isScanning(expense)
            ? translate('iou.receiptStatusTitle')
            : convertToDisplayString(getTransactionDisplayAmount(expense, expense.report, expense.policy), getCurrency(expense));
        const created = getCreated(expense);
        const date = DateUtils.formatWithUTCTimeZone(
            created,
            DateUtils.doesDateBelongToAPastYear(created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
            dateFnsLocale,
        );
        return [expense.formattedMerchant ?? expense.merchant, amount, date].filter(Boolean).join(', ');
    };

    const openExpense = (expense: TransactionListItemType) => {
        const descriptors = Object.fromEntries(
            expenses.map((sibling): [string, TransactionThreadNavigationDescriptor] => [
                sibling.transactionID,
                {reportID: sibling.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID, transaction: sibling, reportAction: sibling.reportAction, report: sibling.report},
            ]),
        );
        const reportID = getReportIDToOpenForExpense(descriptors[expense.transactionID], {
            introSelected,
            conciergeChat,
            isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
            hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
            currentUserEmail,
            currentUserAccountID,
            personalDetails,
            fullPolicySnapshotLastModifiedByPolicyID,
        });
        setActiveTransactionIDs(
            expenses.map((sibling) => sibling.transactionID),
            {source: CAROUSEL_SOURCE.insightsTopExpenses, descriptors},
        ).then(() => {
            markReportRHPWidth(reportID, 'wide');
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo: Navigation.getActiveRoute(), anchorTransactionID: expense.transactionID}));
        });
    };

    if (state === INSIGHTS_DETAILS_SECTION_STATE.STALE || state === INSIGHTS_DETAILS_SECTION_STATE.ERROR) {
        return (
            <InsightsDetailsSectionError
                isStale={state === INSIGHTS_DETAILS_SECTION_STATE.STALE}
                onRetry={retry}
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
                {!!queryJSON && expenses.length > 0 && (
                    <PressableWithoutFeedback
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildViewOnSpendQuery(queryJSON)}))}
                        accessibilityRole={CONST.ROLE.LINK}
                        accessibilityLabel={translate('insightsPage.viewAll')}
                        sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_TOP_EXPENSES_VIEW_ALL}
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
            {state === INSIGHTS_DETAILS_SECTION_STATE.LOADING && (
                <SearchRowSkeleton
                    shouldAnimate
                    fixedNumItems={TOP_EXPENSES_LIMIT}
                    shouldUseNarrowLayout
                />
            )}
            {state === INSIGHTS_DETAILS_SECTION_STATE.OFFLINE && <ChartOfflineState />}
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
                    accessibilityLabel={getRowAccessibilityLabel(item)}
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
                        shouldShowTooltip
                        shouldShowErrors={false}
                        shouldShowCategoryOnNarrowLayout={false}
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
