import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import {getButtonRole} from '@components/Button/utils';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {SortOrder} from '@components/Search/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import useHover from '@hooks/useHover';
import useLocalize from '@hooks/useLocalize';
import {useMouseContext} from '@hooks/useMouseContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getMoneyRequestSpendBreakdown} from '@libs/ReportUtils';
import {compareValues} from '@libs/SearchUIUtils';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';
import {setActiveTransactionReportIDs} from './TransactionReportIDRepository';

type MoneyRequestReportTransactionListProps = {
    report: OnyxTypes.Report;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** Array of report actions for the report that these transactions belong to */
    reportActions: OnyxTypes.ReportAction[];

    /** Whether the report that these transactions belong to has any chat comments */
    hasComments: boolean;
};

const sortableColumnNames = [
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

type SortableColumnName = TupleToUnion<typeof sortableColumnNames>;

type SortedTransactions = {
    transactions: OnyxTypes.Transaction[];
    sortBy: SortableColumnName;
    sortOrder: SortOrder;
};

const isSortableColumnName = (key: unknown): key is SortableColumnName => !!sortableColumnNames.find((val) => val === key);

const getTransactionKey = (transaction: OnyxTypes.Transaction, key: SortableColumnName) => {
    const dateKey = transaction.modifiedCreated ? 'modifiedCreated' : 'created';
    return key === CONST.SEARCH.TABLE_COLUMNS.DATE ? dateKey : key;
};

const areTransactionValuesEqual = (transactions: OnyxTypes.Transaction[], key: SortableColumnName) => {
    const firstValidTransaction = transactions.find((transaction) => transaction !== undefined);
    if (!firstValidTransaction) {
        return true;
    }

    const keyOfFirstValidTransaction = getTransactionKey(firstValidTransaction, key);
    return transactions.every((transaction) => transaction[getTransactionKey(transaction, key)] === firstValidTransaction[keyOfFirstValidTransaction]);
};

function MoneyRequestReportTransactionList({report, transactions, reportActions, hasComments}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const displayNarrowVersion = isMediumScreenWidth || shouldUseNarrowLayout;

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const shouldShowBreakdown = !!nonReimbursableSpend && !!reimbursableSpend;

    const {bind} = useHover();
    const {isMouseDownOnInput, setMouseUp} = useMouseContext();

    const handleMouseLeave = (e: React.MouseEvent<Element, MouseEvent>) => {
        bind.onMouseLeave();
        e.stopPropagation();
        setMouseUp();
    };

    const [sortedData, setSortedData] = useState<SortedTransactions>({
        transactions,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    });

    const {sortBy, sortOrder} = sortedData;

    useEffect(() => {
        if (areTransactionValuesEqual(transactions, sortBy)) {
            return;
        }

        setSortedData((prevState) => ({
            ...prevState,
            transactions: [...transactions].sort((a, b) => compareValues(a[getTransactionKey(a, sortBy)], b[getTransactionKey(b, sortBy)], sortOrder, sortBy)),
        }));
    }, [sortBy, sortOrder, transactions]);

    const navigateToTransaction = useCallback(
        (activeTransaction: OnyxTypes.Transaction) => {
            const iouAction = getIOUActionForTransactionID(reportActions, activeTransaction.transactionID);
            const reportIDToNavigate = iouAction?.childReportID;
            if (!reportIDToNavigate) {
                return;
            }

            const backTo = Navigation.getActiveRoute();

            // Single transaction report will open in RHP, and we need to find every other report ID for the rest of transactions
            // to display prev/next arrows in RHP for navigating between transactions
            const sortedSiblingTransactionReportIDs = getThreadReportIDsForTransactions(reportActions, sortedData.transactions);
            setActiveTransactionReportIDs(sortedSiblingTransactionReportIDs);

            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: reportIDToNavigate, backTo}));
        },
        [reportActions, sortedData.transactions],
    );

    const dateColumnSize = useMemo(() => {
        const shouldShowYearForSomeTransaction = transactions.some((transaction) => shouldShowTransactionYear(transaction));
        return shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    }, [transactions]);

    const pressableStyle = [styles.overflowHidden];

    const listHorizontalPadding = styles.ph5;

    return !isEmpty(transactions) ? (
        <>
            {!displayNarrowVersion && (
                <MoneyRequestReportTableHeader
                    shouldShowSorting
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    dateColumnSize={dateColumnSize}
                    onSortPress={(selectedSortBy, selectedSortOrder) => {
                        if (!isSortableColumnName(selectedSortBy)) {
                            return;
                        }

                        setSortedData((prevState) => ({...prevState, sortBy: selectedSortBy, sortOrder: selectedSortOrder}));
                    }}
                />
            )}
            <View style={[listHorizontalPadding, styles.gap2, styles.pb4, displayNarrowVersion && styles.pt4]}>
                {sortedData.transactions.map((transaction) => {
                    return (
                        <PressableWithFeedback
                            onPress={(e) => {
                                if (isMouseDownOnInput) {
                                    e?.stopPropagation();
                                    return;
                                }

                                navigateToTransaction(transaction);
                            }}
                            accessibilityLabel={translate('iou.viewDetails')}
                            role={getButtonRole(true)}
                            isNested
                            hoverDimmingValue={1}
                            onMouseDown={(e) => e.preventDefault()}
                            id={transaction.transactionID}
                            style={[pressableStyle]}
                            onMouseLeave={handleMouseLeave}
                        >
                            <TransactionItemRow
                                transactionItem={transaction}
                                isSelected={false}
                                shouldShowTooltip
                                dateColumnSize={dateColumnSize}
                                shouldUseNarrowLayout={displayNarrowVersion}
                                shouldShowChatBubbleComponent
                            />
                        </PressableWithFeedback>
                    );
                })}
            </View>
            {shouldShowBreakdown && (
                <View style={[styles.dFlex, styles.alignItemsEnd, listHorizontalPadding, styles.gap2, styles.mb2]}>
                    {[
                        {text: translate('cardTransactions.outOfPocket'), value: formattedOutOfPocketAmount},
                        {text: translate('cardTransactions.companySpend'), value: formattedCompanySpendAmount},
                    ].map(({text, value}) => (
                        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pr3]}>
                            <Text
                                style={[styles.textLabelSupporting, styles.mr3]}
                                numberOfLines={1}
                            >
                                {text}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[styles.textLabelSupporting, styles.textNormal, shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p, styles.textAlignRight]}
                            >
                                {value}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
            <View style={[styles.dFlex, styles.flexRow, listHorizontalPadding, styles.justifyContentBetween, styles.mb2]}>
                <Text style={[styles.textLabelSupporting]}>{hasComments ? translate('common.comments') : ''}</Text>
                <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pr3]}>
                    <Text style={[styles.mr3, styles.textLabelSupporting]}>{translate('common.total')}</Text>
                    <Text style={[shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p, styles.textAlignRight, styles.textBold]}>
                        {convertToDisplayString(totalDisplaySpend, report?.currency)}
                    </Text>
                </View>
            </View>
        </>
    ) : (
        <SearchMoneyRequestReportEmptyState />
    );
}

MoneyRequestReportTransactionList.displayName = 'MoneyRequestReportTransactionList';

export default MoneyRequestReportTransactionList;
