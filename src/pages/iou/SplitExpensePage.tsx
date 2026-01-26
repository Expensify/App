import {deepEqual} from 'fast-equals';
import React, {useEffect} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import TabSelector from '@components/TabSelector/TabSelector';
import useAllTransactions from '@hooks/useAllTransactions';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    addSplitExpenseField,
    clearSplitTransactionDraftErrors,
    evenlyDistributeSplitExpenseAmounts,
    getIOURequestPolicyID,
    initDraftSplitExpenseDataForEdit,
    initSplitExpenseItemData,
    updateSplitExpenseAmountField,
} from '@libs/actions/IOU';
import {getIOUActionForTransactions} from '@libs/actions/IOU/Duplicate';
import {updateSplitTransactionsFromSplitExpensesFlow} from '@libs/actions/IOU/Split';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {calculateSplitAmountFromPercentage, calculateSplitPercentagesFromAmounts} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TabScreenWithFocusTrapWrapper, TopTab} from '@libs/Navigation/OnyxTabNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getReportOrDraftReport, getTransactionDetails, isReportApproved, isSettled as isSettledReportUtils} from '@libs/ReportUtils';
import type {TranslationPathOrText} from '@libs/TransactionPreviewUtils';
import {getChildTransactions, getExpenseTypeTranslationKey, getTransactionType, isManagedCardTransaction, isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SplitList from './SplitList';

type SplitExpensePageProps = PlatformStackScreenProps<SplitExpenseParamList, typeof SCREENS.MONEY_REQUEST.SPLIT_EXPENSE>;

function SplitExpensePage({route}: SplitExpensePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {reportID, transactionID, splitExpenseTransactionID, backTo} = route.params;

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();

    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const searchContext = useSearchContext();

    const {getCurrencySymbol} = useCurrencyList();

    const [selectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.SPLIT_EXPENSE_TAB_TYPE}`, {canBeMissing: true});
    const [draftTransaction, draftTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: false});
    const isLoadingDraftTransaction = isLoadingOnyxValue(draftTransactionMetadata);
    const transactionReport = getReportOrDraftReport(draftTransaction?.reportID);
    const parentTransactionReport = getReportOrDraftReport(transactionReport?.parentReportID);
    const expenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE ? transactionReport : parentTransactionReport;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`, {canBeMissing: true});
    const [expenseReportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(expenseReport?.policyID)}`, {canBeMissing: true});
    const allTransactions = useAllTransactions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`];
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {canBeMissing: true});
    const currentReport = report ?? searchContext?.currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${getIOURequestPolicyID(transaction, currentReport)}`, {canBeMissing: true});

    const policy = usePolicy(currentReport?.policyID);
    const currentPolicy = Object.keys(policy?.employeeList ?? {}).length
        ? policy
        : searchContext?.currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(currentReport?.policyID)}`];

    const isSplitAvailable =
        report &&
        transaction &&
        isSplitAction(currentReport, [transaction], originalTransaction, currentUserPersonalDetails.login ?? '', currentUserPersonalDetails.accountID, currentPolicy);

    const transactionDetails: Partial<TransactionDetails> = getTransactionDetails(transaction) ?? {};
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;
    const sumOfSplitExpenses = (draftTransaction?.comment?.splitExpenses ?? []).reduce((acc, item) => acc + (item.amount ?? 0), 0);
    const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];

    const currencySymbol = getCurrencySymbol(transactionDetails.currency ?? '') ?? transactionDetails.currency ?? CONST.CURRENCY.USD;

    const isPerDiem = isPerDiemRequest(transaction);
    const isCard = isManagedCardTransaction(transaction);
    const originalTransactionID = draftTransaction?.comment?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const iouActions = getIOUActionForTransactions([originalTransactionID], expenseReport?.reportID);
    const {iouReport} = useGetIOUReportFromReportAction(iouActions.at(0));
    const [iouReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(iouReport?.reportID)}`, {canBeMissing: true});

    const isPercentageMode = (selectedTab as string) === CONST.TAB.SPLIT.PERCENTAGE;
    const isDateMode = (selectedTab as string) === CONST.TAB.SPLIT.DATE;
    const childTransactions = getChildTransactions(allTransactions, allReports, transactionID);
    const splitFieldDataFromChildTransactions = childTransactions.map((currentTransaction) => initSplitExpenseItemData(currentTransaction));
    const splitFieldDataFromOriginalTransaction = initSplitExpenseItemData(transaction);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const icons = useMemoizedLazyExpensifyIcons(['ArrowsLeftRight', 'Plus'] as const);

    const {isBetaEnabled} = usePermissions();

    useEffect(() => {
        const errorString = getLatestErrorMessage(draftTransaction ?? {});

        if (errorString) {
            setErrorMessage(errorString);
        }
    }, [draftTransaction, draftTransaction?.errors]);

    useEffect(() => {
        setErrorMessage('');
    }, [sumOfSplitExpenses, splitExpenses]);

    const onAddSplitExpense = () => {
        if (draftTransaction?.errors) {
            clearSplitTransactionDraftErrors(transactionID);
        }
        addSplitExpenseField(transaction, draftTransaction);
    };

    const onMakeSplitsEven = () => {
        if (!draftTransaction) {
            return;
        }
        evenlyDistributeSplitExpenseAmounts(draftTransaction);
    };

    const onSaveSplitExpense = () => {
        if (splitExpenses.length > CONST.IOU.SPLITS_LIMIT) {
            setErrorMessage(translate('iou.error.manySplitsProvided'));
            return;
        }
        if (splitExpenses.length <= 1 && !childTransactions.length) {
            const splitFieldDataFromOriginalTransactionWithoutID = {...splitFieldDataFromOriginalTransaction, transactionID: ''};
            const splitExpenseWithoutID = {...splitExpenses.at(0), transactionID: ''};
            // When we try to save one split during splits creation and if the data is identical to the original transaction we should close the split flow
            if (!childTransactions.length && deepEqual(splitFieldDataFromOriginalTransactionWithoutID, splitExpenseWithoutID)) {
                Navigation.dismissToPreviousRHP();
                return;
            }
            // When we try to save splits during editing splits and if the data is identical to the already created transactions we should close the split flow
            if (childTransactions.length && deepEqual(splitFieldDataFromChildTransactions, splitExpenses)) {
                Navigation.dismissToPreviousRHP();
                return;
            }
            // When we try to save one split during splits creation and if the data is not identical to the original transaction we should show the error
            setErrorMessage(translate('iou.splitExpenseOneMoreSplit'));
            return;
        }
        if (draftTransaction?.errors) {
            clearSplitTransactionDraftErrors(transactionID);
        }
        if (sumOfSplitExpenses > transactionDetailsAmount) {
            const difference = sumOfSplitExpenses - transactionDetailsAmount;
            setErrorMessage(translate('iou.totalAmountGreaterThanOriginal', {amount: convertToDisplayString(difference, transactionDetails?.currency)}));
            return;
        }
        if (sumOfSplitExpenses < transactionDetailsAmount && (isPerDiem || isCard)) {
            const difference = transactionDetailsAmount - sumOfSplitExpenses;
            setErrorMessage(translate('iou.totalAmountLessThanOriginal', {amount: convertToDisplayString(difference, transactionDetails?.currency)}));
            return;
        }

        if (splitExpenses.find((item) => item.amount === 0)) {
            setErrorMessage(translate('iou.splitExpenseZeroAmount'));
            return;
        }

        // When we try to save splits during editing splits and if the data is identical to the already created transactions we should close the split flow
        if (deepEqual(splitFieldDataFromChildTransactions, splitExpenses)) {
            Navigation.dismissToPreviousRHP();
            return;
        }

        updateSplitTransactionsFromSplitExpensesFlow({
            allTransactionsList: allTransactions,
            allReportsList: allReports,
            allReportNameValuePairsList: allReportNameValuePairs,
            transactionData: {
                reportID: draftTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
                originalTransactionID: draftTransaction?.comment?.originalTransactionID ?? String(CONST.DEFAULT_NUMBER_ID),
                splitExpenses,
                splitExpensesTotal: draftTransaction?.comment?.splitExpensesTotal ?? 0,
            },
            searchContext,
            policyCategories,
            policy: expenseReportPolicy,
            policyRecentlyUsedCategories,
            iouReport,
            firstIOU: iouActions.at(0),
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            currentUserPersonalDetails,
            transactionViolations,
            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            quickAction,
            iouReportNextStep,
        });
    };

    const onSplitExpenseValueChange = (id: string, value: number, mode: ValueOf<typeof CONST.TAB.SPLIT>) => {
        if (mode === CONST.TAB.SPLIT.AMOUNT || mode === CONST.TAB.SPLIT.DATE) {
            const amountInCents = convertToBackendAmount(value);
            updateSplitExpenseAmountField(draftTransaction, id, amountInCents);
        } else {
            const amountInCents = calculateSplitAmountFromPercentage(transactionDetailsAmount, value);
            updateSplitExpenseAmountField(draftTransaction, id, amountInCents);
        }
    };

    const getTranslatedText = (item: TranslationPathOrText) => (item.translationPath ? translate(item.translationPath) : (item.text ?? ''));

    const dotSeparator: TranslationPathOrText = {text: ` ${CONST.DOT_SEPARATOR} `};
    const transactionTypeTranslationPath = {translationPath: getExpenseTypeTranslationKey(getTransactionType(transaction))};
    const splitExpensesArray = draftTransaction?.comment?.splitExpenses ?? [];

    const splitAmounts = splitExpensesArray.map((item) => Number(item.amount ?? 0));
    const adjustedPercentages = calculateSplitPercentagesFromAmounts(splitAmounts, transactionDetailsAmount);

    const options: SplitListItemType[] = splitExpensesArray.map((item, index): SplitListItemType => {
        const previewHeaderText: TranslationPathOrText[] = [transactionTypeTranslationPath];
        const currentTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${item?.transactionID}`];
        const currentItemReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`];
        const currentItemPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${currentItemReport?.policyID}`];
        const isApproved = isReportApproved({report: currentItemReport});
        const isSettled = isSettledReportUtils(currentItemReport?.reportID);
        const isCancelled = currentItemReport && currentItemReport?.isCancelledIOU;
        const percentage = adjustedPercentages.at(index) ?? 0;

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
            amount: Number(item.amount),
            merchant: item?.merchant ?? '',
            currency: draftTransaction?.currency ?? CONST.CURRENCY.USD,
            transactionID: item?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            currencySymbol,
            mode: CONST.TAB.SPLIT.AMOUNT,
            percentage,
            onSplitExpenseValueChange,
            isSelected: splitExpenseTransactionID === item.transactionID,
            keyForList: item?.transactionID,
            isEditable:
                !currentTransaction ||
                isSplitAction(currentItemReport, [currentTransaction], originalTransaction, currentUserPersonalDetails.login ?? '', currentUserPersonalDetails.accountID, currentItemPolicy),
        };
    });

    const isInitialSplit = childTransactions.length === 0;

    const listFooterContent = (
        <View style={[styles.w100, styles.flexColumn, styles.mt1, shouldUseNarrowLayout && styles.mb3]}>
            <MenuItem
                onPress={onAddSplitExpense}
                title={translate('iou.addSplit')}
                icon={icons.Plus}
                style={[styles.ph4]}
            />
            {isInitialSplit && (
                <MenuItem
                    onPress={onMakeSplitsEven}
                    title={translate('iou.makeSplitsEven')}
                    icon={icons.ArrowsLeftRight}
                    style={[styles.ph4]}
                />
            )}
        </View>
    );

    const shouldShowWarningMessage = sumOfSplitExpenses < transactionDetailsAmount;
    const warningMessage = shouldShowWarningMessage
        ? translate('iou.totalAmountLessThanOriginal', {amount: convertToDisplayString(transactionDetailsAmount - sumOfSplitExpenses, transactionDetails.currency)})
        : '';
    const footerContent = (
        <View style={[styles.ph5, styles.pb5]}>
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

    const splitStartDate = draftTransaction?.comment?.splitsStartDate;
    const splitEndDate = draftTransaction?.comment?.splitsEndDate;
    const splitDatesTitle = DateUtils.getFormattedSplitDateRange(translate, splitStartDate, splitEndDate);

    const handleDatePress = () => {
        Navigation.navigate(ROUTES.SPLIT_EXPENSE_CREATE_DATE_RANGE.getRoute(reportID, transactionID, Navigation.getActiveRoute()));
    };

    const headerDateContent = (
        <View style={styles.pb3}>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                shouldRenderAsHTML
                key={translate('iou.splitDates')}
                description={translate('iou.splitDates')}
                title={splitDatesTitle}
                onPress={handleDatePress}
                style={[styles.moneyRequestMenuItem]}
                titleWrapperStyle={styles.flex1}
                numberOfLinesTitle={2}
            />
        </View>
    );

    const initiallyFocusedOptionKey = options.find((option) => option.transactionID === splitExpenseTransactionID)?.keyForList;

    let headerTitle = translate('iou.split');
    if (Number(splitExpenseTransactionID)) {
        headerTitle = translate('iou.editSplits');
    } else if (isPercentageMode) {
        headerTitle = translate('iou.splitByPercentage');
    } else if (isDateMode) {
        headerTitle = translate('iou.splitByDate');
    }

    const onSelectRow = (item: SplitListItemType) => {
        if (!item.isEditable) {
            showConfirmModal({
                title: translate('iou.splitExpenseCannotBeEditedModalTitle'),
                prompt: translate('iou.splitExpenseCannotBeEditedModalDescription'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }
        Keyboard.dismiss();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            initDraftSplitExpenseDataForEdit(draftTransaction, item.transactionID, item.reportID ?? reportID);
        });
    };

    if (isLoadingDraftTransaction) {
        return <FullScreenLoadingIndicator style={[styles.opacity1]} />;
    }

    return (
        <ScreenWrapper
            testID="SplitExpensePage"
            shouldEnableMaxHeight={canUseTouchScreen()}
            keyboardAvoidingViewBehavior="height"
            shouldDismissKeyboardBeforeClose={false}
        >
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(draftTransaction) || !isSplitAvailable}>
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        subtitle={translate('iou.splitExpenseSubtitle', {
                            amount: convertToDisplayString(transactionDetailsAmount, transactionDetails?.currency),
                            merchant: draftTransaction?.merchant ?? '',
                        })}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />

                    {isInitialSplit ? (
                        <View style={styles.flex1}>
                            <OnyxTabNavigator
                                id={CONST.TAB.SPLIT_EXPENSE_TAB_TYPE}
                                defaultSelectedTab={CONST.TAB.SPLIT.AMOUNT}
                                tabBar={TabSelector}
                            >
                                <TopTab.Screen name={CONST.TAB.SPLIT.AMOUNT}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <View style={styles.flex1}>
                                                <SplitList
                                                    data={options}
                                                    initiallyFocusedOptionKey={initiallyFocusedOptionKey ?? undefined}
                                                    onSelectRow={onSelectRow}
                                                    listFooterContent={listFooterContent}
                                                    mode={CONST.TAB.SPLIT.AMOUNT}
                                                />
                                                {footerContent}
                                            </View>
                                        </TabScreenWithFocusTrapWrapper>
                                    )}
                                </TopTab.Screen>
                                <TopTab.Screen name={CONST.TAB.SPLIT.PERCENTAGE}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <View style={styles.flex1}>
                                                <SplitList
                                                    data={options}
                                                    initiallyFocusedOptionKey={initiallyFocusedOptionKey ?? undefined}
                                                    onSelectRow={onSelectRow}
                                                    listFooterContent={listFooterContent}
                                                    mode={CONST.TAB.SPLIT.PERCENTAGE}
                                                />
                                                {footerContent}
                                            </View>
                                        </TabScreenWithFocusTrapWrapper>
                                    )}
                                </TopTab.Screen>
                                <TopTab.Screen name={CONST.TAB.SPLIT.DATE}>
                                    {() => (
                                        <TabScreenWithFocusTrapWrapper>
                                            <View style={styles.flex1}>
                                                {headerDateContent}
                                                <SplitList
                                                    data={options}
                                                    initiallyFocusedOptionKey={initiallyFocusedOptionKey ?? undefined}
                                                    onSelectRow={onSelectRow}
                                                    listFooterContent={<View style={[shouldUseNarrowLayout && styles.mb3]} />}
                                                    mode={CONST.TAB.SPLIT.DATE}
                                                />
                                                {footerContent}
                                            </View>
                                        </TabScreenWithFocusTrapWrapper>
                                    )}
                                </TopTab.Screen>
                            </OnyxTabNavigator>
                        </View>
                    ) : (
                        <View style={styles.flex1}>
                            <SplitList
                                data={options}
                                initiallyFocusedOptionKey={initiallyFocusedOptionKey ?? undefined}
                                onSelectRow={onSelectRow}
                                listFooterContent={listFooterContent}
                                mode={CONST.TAB.SPLIT.AMOUNT}
                            />
                            {footerContent}
                        </View>
                    )}
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default SplitExpensePage;
