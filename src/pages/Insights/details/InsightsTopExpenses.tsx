import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import useOpenSearchTransaction from '@components/Search/hooks/useOpenSearchTransaction';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryString} from '@components/Search/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {TOP_EXPENSES_LIMIT} from '@pages/Insights/insightsQueries';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type InsightsTopExpensesProps = {
    /** The largest expenses, largest first */
    expenses: TransactionListItemType[];

    isLoading: boolean;

    /** Whether the expenses can't load because the device is offline */
    isOffline: boolean;

    /** Spend table query that View all opens */
    viewAllQuery: SearchQueryString;
};

/** Lists the largest expenses behind the clicked item, each opening in the RHP. */
function InsightsTopExpenses({expenses, isLoading, isOffline, viewAllQuery}: InsightsTopExpensesProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpRight']);
    const openTransaction = useOpenSearchTransaction();
    const isEmpty = !isLoading && expenses.length === 0;

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.overflowHidden]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.p4, styles.borderBottom]}>
                <Text
                    variant="label"
                    style={styles.textSupporting}
                >
                    {translate('insightsPage.topExpenses')}
                </Text>
                {!isEmpty && (
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
            {isLoading && (
                <SearchRowSkeleton
                    shouldAnimate
                    fixedNumItems={TOP_EXPENSES_LIMIT}
                    shouldUseNarrowLayout
                />
            )}
            {isOffline && <ChartOfflineState />}
            {isEmpty && !isOffline && (
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
                    onPress={() => openTransaction(item)}
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
