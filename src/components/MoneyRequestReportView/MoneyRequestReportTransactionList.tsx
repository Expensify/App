import {useFocusEffect} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import type {TupleToUnion} from 'type-fest';
import {getButtonRole} from '@components/Button/utils';
import Checkbox from '@components/Checkbox';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {SortOrder} from '@components/Search/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import useHover from '@hooks/useHover';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import {useMouseContext} from '@hooks/useMouseContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import {navigationRef} from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {generateReportID, getMoneyRequestSpendBreakdown, isIOUReport} from '@libs/ReportUtils';
import {compareValues} from '@libs/SearchUIUtils';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';
import Navigation from '@navigation/Navigation';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {useMoneyRequestReportContext} from './MoneyRequestReportContext';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';
import {setActiveTransactionThreadIDs} from './TransactionThreadReportIDRepository';

type MoneyRequestReportTransactionListProps = {
    report: OnyxTypes.Report;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** List of transactions that arrived when the report was open */
    newTransactions: OnyxTypes.Transaction[];

    /** Array of report actions for the report that these transactions belong to */
    reportActions: OnyxTypes.ReportAction[];

    /** Whether the report that these transactions belong to has any chat comments */
    hasComments: boolean;

    /** Whether the report actions are being loaded, used to show 'Comments' during loading state */
    isLoadingInitialReportActions?: boolean;

    /** scrollToNewTransaction callback used for scrolling to new transaction when it is created */
    scrollToNewTransaction: (offset: number) => void;
};

type TransactionWithOptionalHighlight = OnyxTypes.Transaction & {
    /** Whether the transaction should be highlighted, when it is added to the report */
    shouldBeHighlighted?: boolean;
};

const sortableColumnNames = [
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

const allReportColumns = [
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS,
    CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT,
];

type SortableColumnName = TupleToUnion<typeof sortableColumnNames>;

type SortedTransactions = {
    sortBy: SortableColumnName;
    sortOrder: SortOrder;
};

type ReportScreenNavigationProps = ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];

const isSortableColumnName = (key: unknown): key is SortableColumnName => !!sortableColumnNames.find((val) => val === key);

const getTransactionKey = (transaction: OnyxTypes.Transaction, key: SortableColumnName) => {
    const dateKey = transaction.modifiedCreated ? 'modifiedCreated' : 'created';
    return key === CONST.SEARCH.TABLE_COLUMNS.DATE ? dateKey : key;
};

function MoneyRequestReportTransactionList({
    report,
    transactions,
    newTransactions,
    reportActions,
    hasComments,
    isLoadingInitialReportActions: isLoadingReportActions,
    scrollToNewTransaction,
}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTransactionID, setSelectedTransactionID] = useState<string>('');

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const shouldShowBreakdown = !!nonReimbursableSpend && !!reimbursableSpend;

    const pendingActionsOpacity = useMemo(() => {
        const pendingAction = transactions.some(getTransactionPendingAction);
        return pendingAction && styles.opacitySemiTransparent;
    }, [styles.opacitySemiTransparent, transactions]);

    const {bind} = useHover();
    const {isMouseDownOnInput, setMouseUp} = useMouseContext();

    const {selectedTransactionsID, setSelectedTransactionsID, toggleTransaction, isTransactionSelected} = useMoneyRequestReportContext();
    const {selectionMode} = useMobileSelectionMode();

    useFocusEffect(
        useCallback(() => {
            return () => {
                if (navigationRef?.getRootState()?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                    return;
                }
                setSelectedTransactionsID([]);
            };
        }, [setSelectedTransactionsID]),
    );

    const handleMouseLeave = (e: React.MouseEvent<Element, MouseEvent>) => {
        bind.onMouseLeave();
        e.stopPropagation();
        setMouseUp();
    };

    const [sortConfig, setSortConfig] = useState<SortedTransactions>({
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    });

    const {sortBy, sortOrder} = sortConfig;

    const sortedTransactions: TransactionWithOptionalHighlight[] = useMemo(() => {
        return [...transactions]
            .sort((a, b) => compareValues(a[getTransactionKey(a, sortBy)], b[getTransactionKey(b, sortBy)], sortOrder, sortBy))
            .map((transaction) => ({
                ...transaction,
                shouldBeHighlighted: newTransactions?.includes(transaction),
            }));
    }, [newTransactions, sortBy, sortOrder, transactions]);

    const navigateToTransaction = useCallback(
        (activeTransaction: OnyxTypes.Transaction) => {
            const iouAction = getIOUActionForTransactionID(reportActions, activeTransaction.transactionID);
            const reportIDToNavigate = iouAction?.childReportID ?? generateReportID();

            const backTo = Navigation.getActiveRoute() as Route;

            // Single transaction report will open in RHP, and we need to find every other report ID for the rest of transactions
            // to display prev/next arrows in RHP for navigating between transactions
            const sortedSiblingTransactionReportIDs = getThreadReportIDsForTransactions(reportActions, sortedTransactions);
            setActiveTransactionThreadIDs(sortedSiblingTransactionReportIDs);

            const routeParams = {
                reportID: reportIDToNavigate,
                backTo,
            } as ReportScreenNavigationProps;

            if (!iouAction?.childReportID) {
                routeParams.moneyRequestReportActionID = iouAction?.reportActionID;
                routeParams.transactionID = activeTransaction.transactionID;
                routeParams.iouReportID = activeTransaction.reportID;
            }

            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(routeParams));
        },
        [reportActions, sortedTransactions],
    );

    const dateColumnSize = useMemo(() => {
        const shouldShowYearForSomeTransaction = transactions.some((transaction) => shouldShowTransactionYear(transaction));
        return shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    }, [transactions]);

    const pressableStyle = [styles.overflowHidden];

    const listHorizontalPadding = styles.ph5;
    return !isEmpty(transactions) ? (
        <>
            {!shouldUseNarrowLayout && (
                <View style={[styles.dFlex, styles.flexRow, styles.pl5, styles.pr8, styles.alignItemsCenter]}>
                    <View style={[styles.dFlex, styles.flexRow, styles.pv2, styles.pr4, StyleUtils.getPaddingLeft(variables.w12)]}>
                        <Checkbox
                            onPress={() => {
                                if (selectedTransactionsID.length !== 0) {
                                    setSelectedTransactionsID([]);
                                } else {
                                    setSelectedTransactionsID(transactions.filter((t) => !isTransactionPendingDelete(t)).map((t) => t.transactionID));
                                }
                            }}
                            accessibilityLabel={CONST.ROLE.CHECKBOX}
                            isIndeterminate={selectedTransactionsID.length > 0 && selectedTransactionsID.length !== transactions.length}
                            isChecked={selectedTransactionsID.length === transactions.length}
                        />
                        {isMediumScreenWidth && <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>}
                    </View>
                    {!isMediumScreenWidth && (
                        <MoneyRequestReportTableHeader
                            shouldShowSorting
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            dateColumnSize={dateColumnSize}
                            onSortPress={(selectedSortBy, selectedSortOrder) => {
                                if (!isSortableColumnName(selectedSortBy)) {
                                    return;
                                }

                                setSortConfig((prevState) => ({...prevState, sortBy: selectedSortBy, sortOrder: selectedSortOrder}));
                            }}
                            isIOUReport={isIOUReport(report)}
                        />
                    )}
                </View>
            )}
            <View style={[listHorizontalPadding, styles.gap2, styles.pb4]}>
                {sortedTransactions.map((transaction) => {
                    return (
                        <PressableWithFeedback
                            key={transaction.transactionID}
                            onPress={(e) => {
                                if (isMouseDownOnInput) {
                                    e?.stopPropagation();
                                    return;
                                }

                                if (selectionMode?.isEnabled) {
                                    toggleTransaction(transaction.transactionID);
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
                            style={[pressableStyle, styles.userSelectNone]}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            onMouseLeave={handleMouseLeave}
                            onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                            onPressOut={() => ControlSelection.unblock()}
                            onLongPress={() => {
                                if (!isSmallScreenWidth) {
                                    return;
                                }
                                if (selectionMode?.isEnabled) {
                                    toggleTransaction(transaction.transactionID);
                                    return;
                                }
                                setSelectedTransactionID(transaction.transactionID);
                                setIsModalVisible(true);
                            }}
                            disabled={isTransactionPendingDelete(transaction)}
                        >
                            <TransactionItemRow
                                transactionItem={transaction}
                                isSelected={isTransactionSelected(transaction.transactionID)}
                                dateColumnSize={dateColumnSize}
                                shouldShowTooltip
                                shouldUseNarrowLayout={shouldUseNarrowLayout || isMediumScreenWidth}
                                shouldShowCheckbox={!!selectionMode?.isEnabled || !isSmallScreenWidth}
                                onCheckboxPress={toggleTransaction}
                                columns={allReportColumns}
                                scrollToNewTransaction={transaction.transactionID === newTransactions?.at(0)?.transactionID ? scrollToNewTransaction : undefined}
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
                <Animated.Text
                    style={[styles.textLabelSupporting]}
                    entering={hasComments ? undefined : FadeIn}
                    exiting={FadeOut}
                >
                    {hasComments || isLoadingReportActions ? translate('common.comments') : ''}
                </Animated.Text>
                <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pr3]}>
                    <Text style={[styles.mr3, styles.textLabelSupporting]}>{translate('common.total')}</Text>
                    <Text style={[shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p, styles.textAlignRight, styles.textBold, pendingActionsOpacity]}>
                        {convertToDisplayString(totalDisplaySpend, report?.currency)}
                    </Text>
                </View>
            </View>
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={Expensicons.CheckSquare}
                    onPress={() => {
                        if (!selectionMode?.isEnabled) {
                            turnOnMobileSelectionMode();
                        }
                        toggleTransaction(selectedTransactionID);
                        setIsModalVisible(false);
                    }}
                />
            </Modal>
        </>
    ) : (
        <SearchMoneyRequestReportEmptyState />
    );
}

MoneyRequestReportTransactionList.displayName = 'MoneyRequestReportTransactionList';

export default memo(MoneyRequestReportTransactionList);
export type {TransactionWithOptionalHighlight};
