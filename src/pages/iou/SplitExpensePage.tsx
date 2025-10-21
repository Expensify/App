import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionListWithSections';
import type {SectionListDataType, SplitListItemType} from '@components/SelectionListWithSections/types';
import useDisplayFocusedInputUnderKeyboard from '@hooks/useDisplayFocusedInputUnderKeyboard';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    addSplitExpenseField,
    clearSplitTransactionDraftErrors,
    getIOUActionForTransactions,
    getIOURequestPolicyID,
    initDraftSplitExpenseDataForEdit,
    initSplitExpenseItemData,
    saveSplitTransactions,
    updateSplitExpenseAmountField,
} from '@libs/actions/IOU';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getReportOrDraftReport, getTransactionDetails, isReportApproved, isSettled as isSettledReportUtils} from '@libs/ReportUtils';
import type {TranslationPathOrText} from '@libs/TransactionPreviewUtils';
import {getChildTransactions, isManagedCardTransaction, isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitExpensePageProps = PlatformStackScreenProps<SplitExpenseParamList, typeof SCREENS.MONEY_REQUEST.SPLIT_EXPENSE>;

function SplitExpensePage({route}: SplitExpensePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {listRef, viewRef, footerRef, bottomOffset, scrollToFocusedInput, SplitListItem} = useDisplayFocusedInputUnderKeyboard();

    const {reportID, transactionID, splitExpenseTransactionID, backTo} = route.params;

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [cannotBeEditedModalVisible, setCannotBeEditedModalVisible] = useState(false);

    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const {currentSearchHash} = useSearchContext();

    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: false});
    const transactionReport = getReportOrDraftReport(draftTransaction?.reportID);
    const parentTransactionReport = getReportOrDraftReport(transactionReport?.parentReportID);
    const expenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? transactionReport : parentTransactionReport;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`, {canBeMissing: true});
    const [expenseReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`, {canBeMissing: true});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: false});
    const [currencyList] = useOnyx(ONYXKEYS.CURRENCY_LIST, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {canBeMissing: true});
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getIOURequestPolicyID(transaction, report)}`, {canBeMissing: true});

    const policy = usePolicy(report?.policyID);
    const isSplitAvailable = report && transaction && isSplitAction(report, [transaction], policy);

    const transactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;
    const sumOfSplitExpenses = useMemo(() => (draftTransaction?.comment?.splitExpenses ?? []).reduce((acc, item) => acc + Math.abs(item.amount ?? 0), 0), [draftTransaction]);
    const splitExpenses = useMemo(() => draftTransaction?.comment?.splitExpenses ?? [], [draftTransaction?.comment?.splitExpenses]);

    const currencySymbol = currencyList?.[transactionDetails.currency ?? '']?.symbol ?? transactionDetails.currency ?? CONST.CURRENCY.USD;

    const isPerDiem = isPerDiemRequest(transaction);
    const isCard = isManagedCardTransaction(transaction);
    const originalTransactionID = draftTransaction?.comment?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const iouActions = getIOUActionForTransactions([originalTransactionID], expenseReport?.reportID);
    const {iouReport, chatReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(iouActions.at(0));

    const childTransactions = useMemo(() => getChildTransactions(transactionID), [transactionID]);
    const splitFieldDataFromChildTransactions = useMemo(() => childTransactions.map((currentTransaction) => initSplitExpenseItemData(currentTransaction)), [childTransactions]);
    const splitFieldDataFromOriginalTransaction = useMemo(() => initSplitExpenseItemData(transaction), [transaction]);

    useEffect(() => {
        const errorString = getLatestErrorMessage(draftTransaction ?? {});

        if (errorString) {
            setErrorMessage(errorString);
        }
    }, [draftTransaction, draftTransaction?.errors]);

    useEffect(() => {
        setErrorMessage('');
    }, [sumOfSplitExpenses, draftTransaction?.comment?.splitExpenses?.length]);

    const onAddSplitExpense = useCallback(() => {
        if (draftTransaction?.errors) {
            clearSplitTransactionDraftErrors(transactionID);
        }
        addSplitExpenseField(transaction, draftTransaction);
    }, [draftTransaction, transaction, transactionID]);

    const onSaveSplitExpense = useCallback(() => {
        if (splitExpenses.length <= 1 && (!childTransactions.length || !isBetaEnabled(CONST.BETAS.NEWDOT_REVERT_SPLITS))) {
            const splitFieldDataFromOriginalTransactionWithoutID = {...splitFieldDataFromOriginalTransaction, transactionID: ''};
            const splitExpenseWithoutID = {...splitExpenses.at(0), transactionID: ''};
            // When we try to save one split during splits creation and if the data is identical to the original transaction we should close the split flow
            if (!childTransactions.length && deepEqual(splitFieldDataFromOriginalTransactionWithoutID, splitExpenseWithoutID)) {
                Navigation.dismissModal();
                return;
            }
            // When we try to save splits during editing splits and if the data is identical to the already created transactions we should close the split flow
            if (childTransactions.length && deepEqual(splitFieldDataFromChildTransactions, splitExpenses)) {
                Navigation.dismissModal();
                return;
            }
            // When we try to save one split during splits creation and if the data is not identical to the original transaction we should show the error
            setErrorMessage(translate('iou.splitExpenseOneMoreSplit'));
            return;
        }
        if (draftTransaction?.errors) {
            clearSplitTransactionDraftErrors(transactionID);
        }
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

        if (splitExpenses.find((item) => item.amount === 0)) {
            setErrorMessage(translate('iou.splitExpenseZeroAmount'));
            return;
        }

        // When we try to save splits during editing splits and if the data is identical to the already created transactions we should close the split flow
        if (deepEqual(splitFieldDataFromChildTransactions, splitExpenses)) {
            Navigation.dismissModal();
            return;
        }

        saveSplitTransactions(
            originalTransactionID,
            draftTransaction,
            currentSearchHash,
            policyCategories,
            expenseReportPolicy,
            policyRecentlyUsedCategories,
            iouReport,
            chatReport,
            iouActions.at(0),
            isChatIOUReportArchived,
        );
    }, [
        splitExpenses,
        childTransactions.length,
        isBetaEnabled,
        draftTransaction,
        sumOfSplitExpenses,
        transactionDetailsAmount,
        isPerDiem,
        isCard,
        splitFieldDataFromChildTransactions,
        currentSearchHash,
        policyCategories,
        expenseReportPolicy,
        policyRecentlyUsedCategories,
        splitFieldDataFromOriginalTransaction,
        translate,
        transactionID,
        transactionDetails?.currency,
        isChatIOUReportArchived,
        iouReport,
        iouActions,
        chatReport,
        originalTransactionID,
    ]);

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
        const isTransactionMadeWithCard = isManagedCardTransaction(transaction);
        const showCashOrCard: TranslationPathOrText = {translationPath: isTransactionMadeWithCard ? 'iou.card' : 'iou.cash'};

        const items: SplitListItemType[] = (draftTransaction?.comment?.splitExpenses ?? []).map((item): SplitListItemType => {
            const previewHeaderText: TranslationPathOrText[] = [showCashOrCard];
            const currentTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${item?.transactionID}`];
            const currentReport = getReportOrDraftReport(currentTransaction?.reportID) as Report;
            const isApproved = isReportApproved({report: currentReport});
            const isSettled = isSettledReportUtils(currentReport?.reportID);
            const isCancelled = currentReport && currentReport?.isCancelledIOU;

            const date = DateUtils.formatWithUTCTimeZone(
                item.created,
                DateUtils.doesDateBelongToAPastYear(item.created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
            );
            previewHeaderText.unshift({text: date}, dotSeparator);

            if (isCancelled) {
                previewHeaderText.push(dotSeparator, {text: translate('iou.canceled')});
            } else if (isApproved) {
                previewHeaderText.push(dotSeparator, {text: translate('iou.approved')});
            } else if (isSettled) {
                previewHeaderText.push(dotSeparator, {text: translate('iou.settledExpensify')});
            }

            const headerText = previewHeaderText.reduce((text, currentKey) => {
                return `${text}${getTranslatedText(currentKey)}`;
            }, '');

            return {
                ...item,
                headerText,
                originalAmount: transactionDetailsAmount,
                amount: transactionDetailsAmount >= 0 ? Math.abs(Number(item.amount)) : Number(item.amount),
                merchant: item?.merchant ?? '',
                currency: draftTransaction?.currency ?? CONST.CURRENCY.USD,
                transactionID: item?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                currencySymbol,
                onSplitExpenseAmountChange,
                isSelected: splitExpenseTransactionID === item.transactionID,
                keyForList: item?.transactionID,
                isEditable: (item.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.CLOSED,
            };
        });

        const newSections: Array<SectionListDataType<SplitListItemType>> = [{data: items}];

        return [newSections];
    }, [
        transaction,
        draftTransaction?.comment?.splitExpenses,
        draftTransaction?.currency,
        allTransactions,
        transactionDetailsAmount,
        currencySymbol,
        onSplitExpenseAmountChange,
        splitExpenseTransactionID,
        translate,
        getTranslatedText,
    ]);

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
        const shouldShowWarningMessage = sumOfSplitExpenses < Math.abs(transactionDetailsAmount);
        const warningMessage = shouldShowWarningMessage
            ? translate('iou.totalAmountLessThanOriginal', {amount: convertToDisplayString(Math.abs(transactionDetailsAmount) - sumOfSplitExpenses, transactionDetails.currency)})
            : '';
        return (
            <View
                ref={footerRef}
                style={styles.pt3}
            >
                {(!!errorMessage || !!warningMessage) && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError={!!errorMessage}
                        isInfo={!errorMessage && shouldShowWarningMessage}
                        message={errorMessage || warningMessage}
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
            </View>
        );
    }, [sumOfSplitExpenses, transactionDetailsAmount, translate, transactionDetails.currency, errorMessage, styles.ph1, styles.mb2, styles.w100, onSaveSplitExpense, styles.pt3, footerRef]);

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
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(draftTransaction) || !isSplitAvailable}>
                <View
                    ref={viewRef}
                    style={styles.flex1}
                    onLayout={() => {
                        scrollToFocusedInput();
                    }}
                >
                    <HeaderWithBackButton
                        title={splitExpenseTransactionID ? translate('iou.editSplits') : translate('iou.split')}
                        subtitle={translate('iou.splitExpenseSubtitle', {
                            amount: convertToDisplayString(transactionDetailsAmount, transactionDetails?.currency),
                            merchant: draftTransaction?.merchant ?? '',
                        })}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />
                    <SelectionList
                        /* Keeps input fields visible above keyboard on mobile */
                        renderScrollComponent={(props) => (
                            <KeyboardAwareScrollView
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...props}
                                bottomOffset={bottomOffset.current} /* Bottom offset ensures inputs stay above the "save" button */
                            />
                        )}
                        onSelectRow={(item) => {
                            if (!item.isEditable) {
                                setCannotBeEditedModalVisible(true);
                                return;
                            }
                            Keyboard.dismiss();
                            // eslint-disable-next-line @typescript-eslint/no-deprecated
                            InteractionManager.runAfterInteractions(() => {
                                initDraftSplitExpenseDataForEdit(draftTransaction, item.transactionID, item.reportID ?? reportID);
                            });
                        }}
                        ref={listRef}
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
                        removeClippedSubviews={false}
                    />
                </View>
                <ConfirmModal
                    title={translate('iou.splitExpenseCannotBeEditedModalTitle')}
                    prompt={translate('iou.splitExpenseCannotBeEditedModalDescription')}
                    onConfirm={() => setCannotBeEditedModalVisible(false)}
                    onCancel={() => setCannotBeEditedModalVisible(false)}
                    confirmText={translate('common.buttonConfirm')}
                    isVisible={cannotBeEditedModalVisible}
                    shouldShowCancelButton={false}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}
SplitExpensePage.displayName = 'SplitExpensePage';

export default SplitExpensePage;
