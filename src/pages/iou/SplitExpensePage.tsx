import noop from 'lodash/noop';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import SplitListItem from '@components/SelectionList/SplitListItem';
import type {SectionListDataType, SplitListItemType} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {addSplitExpenseField, saveSplitTransactions, updateSplitExpenseAmountField} from '@libs/actions/IOU';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {isCardTransaction, isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitExpensePageProps = PlatformStackScreenProps<SplitExpenseParamList, typeof SCREENS.MONEY_REQUEST.SPLIT_EXPENSE>;

function SplitExpensePage({route}: SplitExpensePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {reportID, transactionID, splitExpenseTransactionID, backTo} = route.params;

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const {currentSearchHash} = useSearchContext();

    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: false});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});

    const transactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;
    const sumOfSplitExpenses = useMemo(() => (draftTransaction?.comment?.splitExpenses ?? []).reduce((acc, item) => acc + Math.abs(item.amount ?? 0), 0), [draftTransaction]);
    const currencySymbol = currencyList?.[transactionDetails.currency ?? '']?.symbol ?? transactionDetails.currency ?? CONST.CURRENCY.USD;

    const isPerDiem = isPerDiemRequest(transaction);
    const isCard = isCardTransaction(transaction);

    useEffect(() => {
        setErrorMessage(null);
    }, [sumOfSplitExpenses, draftTransaction?.comment?.splitExpenses?.length]);

    const onAddSplitExpense = useCallback(() => {
        addSplitExpenseField(transaction, draftTransaction);
    }, [draftTransaction, transaction]);

    const onSaveSplitExpense = useCallback(() => {
        if (sumOfSplitExpenses > Math.abs(transactionDetailsAmount)) {
            const difference = sumOfSplitExpenses - Math.abs(transactionDetailsAmount);
            setErrorMessage(translate('iou.totalAmountGreaterThanOriginal', {amount: convertToDisplayString(difference, transactionDetails?.currency)}));
            return;
        }
        if (sumOfSplitExpenses < Math.abs(transactionDetailsAmount) && (isPerDiem || isCard)) {
            const difference = Math.abs(transactionDetailsAmount) - sumOfSplitExpenses;
            setErrorMessage(translate('iou.totalAmountLessThanOriginal', {amount: convertToDisplayString(difference, transactionDetails?.currency)}));
            return;
        }

        if ((draftTransaction?.comment?.splitExpenses ?? []).find((item) => item.amount === 0)) {
            setErrorMessage(translate('iou.splitExpenseZeroAmount'));
            return;
        }

        saveSplitTransactions(draftTransaction, currentSearchHash);
    }, [currentSearchHash, draftTransaction, isCard, isPerDiem, sumOfSplitExpenses, transactionDetailsAmount, transactionDetails?.currency, translate]);

    const onSaveSplitExpenseByCategory = useCallback(() => {
        if (sumOfSplitExpenses > Math.abs(transactionDetailsAmount)) {
            const difference = sumOfSplitExpenses - Math.abs(transactionDetailsAmount);
            setErrorMessage(translate('iou.totalAmountGreaterThanOriginal', {amount: convertToDisplayString(difference, transactionDetails?.currency)}));
            return;
        }
        if (sumOfSplitExpenses < Math.abs(transactionDetailsAmount) && (isPerDiem || isCard)) {
            const difference = Math.abs(transactionDetailsAmount) - sumOfSplitExpenses;
            setErrorMessage(translate('iou.totalAmountLessThanOriginal', {amount: convertToDisplayString(difference, transactionDetails?.currency)}));
            return;
        }

        if ((draftTransaction?.comment?.splitExpenses ?? []).find((item) => item.amount === 0)) {
            setErrorMessage(translate('iou.splitExpenseZeroAmount'));
            return;
        }

        if (!draftTransaction?.comment?.splitExpenses) {
            return;
        }

        // Group expenses by category and create one split per category
        type CategoryGroup = {
            category: string;
            total: number;
            expenses: Array<NonNullable<typeof draftTransaction.comment.splitExpenses>[0]>;
            created: string;
            description: string;
            tags?: string[];
        };

        const expensesGroupedByCategory: Record<string, CategoryGroup> = {};
        for (const expense of draftTransaction?.comment?.splitExpenses ?? []) {
            const category = expense.category ?? CONST.POLICY.DEFAULT_CATEGORIES.OTHER;
            if (!(category in expensesGroupedByCategory)) {
                expensesGroupedByCategory[category] = {
                    category,
                    total: 0,
                    expenses: [],
                    created: expense.created ?? '',
                    description: '',
                    tags: expense.tags,
                };
            }

            // Keep a running total for each category
            expensesGroupedByCategory[category].total += Number(expense.amount);
            expensesGroupedByCategory[category].expenses.push(expense);

            // Use the earliest date for the category
            const expenseCreated = expense.created ?? '';
            if (expenseCreated && expenseCreated < expensesGroupedByCategory[category].created) {
                expensesGroupedByCategory[category].created = expenseCreated;
            }

            // Combine descriptions
            if (expense.description) {
                if (expensesGroupedByCategory[category].description) {
                    expensesGroupedByCategory[category].description = `${expensesGroupedByCategory[category].description}, ${expense.description}`;
                } else {
                    expensesGroupedByCategory[category].description = expense.description;
                }
            }
        }

        // Create a new draft transaction with category-based splits
        const categoryBasedSplitExpenses = Object.values(expensesGroupedByCategory).map((categoryGroup) => ({
            amount: categoryGroup.total,
            category: categoryGroup.category,
            created: categoryGroup.created,
            description: categoryGroup.description,
            tags: categoryGroup.tags,
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        }));

        if (!draftTransaction) {
            return;
        }

        const categoryBasedDraftTransaction = {
            ...draftTransaction,
            amount: draftTransaction.amount ?? 0,
            comment: {
                ...draftTransaction.comment,
                splitExpenses: categoryBasedSplitExpenses,
            },
        };

        saveSplitTransactions(categoryBasedDraftTransaction, currentSearchHash);
    }, [currentSearchHash, draftTransaction, isCard, isPerDiem, sumOfSplitExpenses, transactionDetailsAmount, transactionDetails?.currency, translate]);

    const onSplitExpenseAmountChange = useCallback(
        (currentItemTransactionID: string, value: number) => {
            const amountInCents = convertToBackendAmount(value);
            updateSplitExpenseAmountField(draftTransaction, currentItemTransactionID, amountInCents);
        },
        [draftTransaction],
    );

    const sections = useMemo(() => {
        const cashOrCard = translate(isCard ? 'iou.card' : 'iou.cash');

        // First group expenses by category
        const expensesGroupedByCategory: Record<string, SplitListItemType> = {};
        for (const expense of draftTransaction?.comment?.splitExpenses ?? []) {
            const category = expense.category ?? CONST.POLICY.DEFAULT_CATEGORIES.OTHER;
            if (!(category in expensesGroupedByCategory)) {
                expensesGroupedByCategory[category] = {
                    category,
                    total: 0,
                    expenses: [],
                    keyForList: category,
                    dateRange: '',
                    parentDraftTransaction: draftTransaction,
                    reportID,
                };
            }

            // Keep a running total for each category
            expensesGroupedByCategory[category].total += Number(expense.amount);

            const date = DateUtils.formatWithUTCTimeZone(
                expense.created,
                DateUtils.doesDateBelongToAPastYear(expense.created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
            );
            const headerText = `${date} ${CONST.DOT_SEPARATOR} ${cashOrCard}`;
            expensesGroupedByCategory[category].expenses.push({
                ...expense,
                headerText,
                originalAmount: transactionDetailsAmount,
                amount: transactionDetailsAmount >= 0 ? Math.abs(Number(expense.amount)) : Number(expense.amount),
                merchant: draftTransaction?.merchant ?? '',
                currency: draftTransaction?.currency ?? CONST.CURRENCY.USD,
                transactionID: expense?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                currencySymbol,
                onSplitExpenseAmountChange,
                isTransactionLinked: splitExpenseTransactionID === expense.transactionID,
            });
        }

        // Then calculate the date range for each category
        const sectionList = Object.values(expensesGroupedByCategory);
        for (const section of sectionList) {
            let startDate = '';
            let endDate = '';
            for (const expense of section.expenses) {
                if (!startDate) {
                    startDate = expense.created;
                }
                if (!endDate) {
                    endDate = expense.created;
                }
                if (expense.created < startDate) {
                    startDate = expense.created;
                }
                if (expense.created > endDate) {
                    endDate = expense.created;
                }
            }
            section.dateRange = DateUtils.getFormattedDateRange(DateUtils.parseLocaleDateUTC(startDate), DateUtils.parseLocaleDateUTC(endDate));
        }

        return [{data: Object.values(expensesGroupedByCategory)}] as Array<SectionListDataType<SplitListItemType>>;
    }, [translate, isCard, draftTransaction, transactionDetailsAmount, currencySymbol, onSplitExpenseAmountChange, splitExpenseTransactionID, reportID]);

    const headerContent = useMemo(
        () => (
            <View style={[styles.w100, styles.ph5, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <Button
                    success
                    onPress={onAddSplitExpense}
                    icon={Expensicons.Plus}
                    text={translate('iou.addSplit')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
            </View>
        ),
        [onAddSplitExpense, shouldUseNarrowLayout, styles.flex1, styles.flexRow, styles.gap2, styles.mb3, styles.ph5, styles.w100, translate],
    );

    const footerContent = useMemo(() => {
        return (
            <>
                {!!errorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={errorMessage}
                    />
                )}
                <Button
                    large
                    style={[styles.w100, styles.mb3]}
                    text={translate('iou.splitByItem')}
                    onPress={onSaveSplitExpense}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                />
                <Button
                    success
                    large
                    style={[styles.w100]}
                    text={translate('iou.splitByCategory')}
                    onPress={onSaveSplitExpenseByCategory}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                />
            </>
        );
    }, [onSaveSplitExpense, onSaveSplitExpenseByCategory, styles.mb2, styles.mb3, styles.ph1, styles.w100, translate, errorMessage]);

    return (
        <ScreenWrapper
            testID={SplitExpensePage.displayName}
            shouldEnableMaxHeight={canUseTouchScreen()}
            keyboardAvoidingViewBehavior="height"
            shouldDismissKeyboardBeforeClose={false}
        >
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(draftTransaction)}>
                <View style={[styles.flex1]}>
                    <HeaderWithBackButton
                        title={translate('iou.split')}
                        subtitle={translate('iou.splitExpenseSubtitle', {
                            amount: convertToDisplayString(transactionDetailsAmount, transactionDetails?.currency),
                            merchant: draftTransaction?.merchant ?? '',
                        })}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />
                    <SelectionList
                        onSelectRow={noop}
                        headerContent={headerContent}
                        sections={sections}
                        ListItem={SplitListItem}
                        containerStyle={[styles.flexBasisAuto, styles.pt1]}
                        footerContent={footerContent}
                        disableKeyboardShortcuts
                        shouldSingleExecuteRowSelect
                        canSelectMultiple={false}
                        shouldPreventDefaultFocusOnSelectRow
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}
SplitExpensePage.displayName = 'SplitExpensePage';

export default SplitExpensePage;
