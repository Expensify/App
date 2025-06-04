import React, {useCallback, useEffect, useMemo} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
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
import {addSplitExpenseField, initDraftSplitExpenseDataForEdit, saveSplitTransactions, updateSplitExpenseAmountField} from '@libs/actions/IOU';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import type {TranslationPathOrText} from '@libs/TransactionPreviewUtils';
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

    const onSplitExpenseAmountChange = useCallback(
        (currentItemTransactionID: string, value: number) => {
            const amountInCents = convertToBackendAmount(value);
            updateSplitExpenseAmountField(draftTransaction, currentItemTransactionID, amountInCents);
        },
        [draftTransaction],
    );

    const getTranslatedText = useCallback((item: TranslationPathOrText) => (item.translationPath ? translate(item.translationPath) : (item.text ?? '')), [translate]);

    const [sections] = useMemo(() => {
        const dotSeparator: TranslationPathOrText = {text: ` ${CONST.DOT_SEPARATOR} `};
        const isTransactionMadeWithCard = isCardTransaction(transaction);
        const showCashOrCard: TranslationPathOrText = {translationPath: isTransactionMadeWithCard ? 'iou.card' : 'iou.cash'};

        const items: SplitListItemType[] = (draftTransaction?.comment?.splitExpenses ?? []).map((item): SplitListItemType => {
            const previewHeaderText: TranslationPathOrText[] = [showCashOrCard];

            const date = DateUtils.formatWithUTCTimeZone(
                item.created,
                DateUtils.doesDateBelongToAPastYear(item.created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
            );
            previewHeaderText.unshift({text: date}, dotSeparator);

            const headerText = previewHeaderText.reduce((text, currentKey) => {
                return `${text}${getTranslatedText(currentKey)}`;
            }, '');

            return {
                ...item,
                headerText,
                originalAmount: transactionDetailsAmount,
                amount: transactionDetailsAmount >= 0 ? Math.abs(Number(item.amount)) : Number(item.amount),
                merchant: draftTransaction?.merchant ?? '',
                currency: draftTransaction?.currency ?? CONST.CURRENCY.USD,
                transactionID: item?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                currencySymbol,
                onSplitExpenseAmountChange,
                isTransactionLinked: splitExpenseTransactionID === item.transactionID,
                keyForList: item?.transactionID,
            };
        });

        const newSections: Array<SectionListDataType<SplitListItemType>> = [{data: items}];

        return [newSections];
    }, [transaction, draftTransaction, getTranslatedText, transactionDetailsAmount, currencySymbol, onSplitExpenseAmountChange, splitExpenseTransactionID]);

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
                    success
                    large
                    style={[styles.w100]}
                    text={translate('common.save')}
                    onPress={onSaveSplitExpense}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                />
            </>
        );
    }, [onSaveSplitExpense, styles.mb2, styles.ph1, styles.w100, translate, errorMessage]);

    const initiallyFocusedOptionKey = useMemo(
        () => sections.at(0)?.data.find((option) => option.transactionID === splitExpenseTransactionID)?.keyForList,
        [sections, splitExpenseTransactionID],
    );

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
                        onSelectRow={(item) => {
                            Keyboard.dismiss();
                            InteractionManager.runAfterInteractions(() => {
                                initDraftSplitExpenseDataForEdit(draftTransaction, item.transactionID, reportID);
                            });
                        }}
                        headerContent={headerContent}
                        sections={sections}
                        initiallyFocusedOptionKey={initiallyFocusedOptionKey}
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
