import DatePicker from '@components/DatePicker';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearMoneyRequestCreated, setMoneyRequestCreated, updateDistanceRateOnExpenseDateChange} from '@libs/actions/IOU/MoneyRequest';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyExpenseChat as isPolicyExpenseChatReportUtil} from '@libs/ReportUtils';
import {hasAnyManuallyEnteredScanField, isPartiallyEnteredScanExpense} from '@libs/TransactionUtils';

import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';

import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';

import AutomaticFieldHint from './AutomaticFieldHint';
import {dateStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type DateFieldProps = {
    shouldDisplayFieldError: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    formError: string;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
};

function DateField({shouldDisplayFieldError, didConfirm, isReadOnly, formError, transactionID, action, iouType, reportID, reportActionID}: DateFieldProps) {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isEditingSplitBill, canEnterScanFieldsManually} = useConfirmationFields();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const policyForTrackExpense = usePolicy(isTrackExpense ? policyForMovingExpensesID : undefined);

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const policy = usePolicy(report?.policyID);
    const personalPolicy = usePersonalPolicy();

    const dateState = useTransactionSelector(transactionID, dateStateSelector);
    const transaction = useTransactionSelector(transactionID, (t) => t);

    const iouCreated = dateState?.iouCreated ?? '';
    const createdMissing = dateState?.isMissing ?? true;
    const transactionHasReceipt = dateState?.hasReceipt ?? false;

    // A draft is seeded with today's date, but in the Scan flow the date belongs to the receipt, not to today, so the
    // picker stays empty until the user picks one, the same way the amount field starts empty.
    const shouldShowEmptyDate = canEnterScanFieldsManually && !dateState?.isCreatedSet;

    // Opening the calendar blurs the input, so the open picker is this field's "the user is on it" signal rather
    // than focus, and it is what draws the focused border. The hint follows it so it can't sit next to an open
    // calendar promising to fill in the date the user is picking. Entering any one of the three fields drops the hint
    // from all of them, since that is the point where the expense stops being scanned.
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const shouldShowAutomaticHint = shouldShowEmptyDate && !isDatePickerOpen && !hasAnyManuallyEnteredScanField(dateState);

    const dateErrorText = shouldDisplayFieldError && createdMissing ? translate('common.error.enterDate') : '';

    // On a half-filled Scan the date is required even though it is never blank in the draft, so the all-or-nothing
    // predicate stands in for `createdMissing` there.
    const isDateRequiredMissing = isPartiallyEnteredScanExpense(dateState, canEnterScanFieldsManually) ? !dateState?.isCreatedSet : createdMissing;
    const inlineDateErrorText = formError === 'common.error.fieldRequired' && isDateRequiredMissing ? translate('common.error.fieldRequired') : '';

    const handleDateChange = (newDate: string) => {
        if (!transactionID) {
            return;
        }

        // While the picker renders empty the persisted date is only a default, so a pick that matches it still has to
        // be written. That write is what marks the date as chosen by the user.
        if (newDate === iouCreated && !shouldShowEmptyDate) {
            return;
        }

        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {created: newDate}, getCurrencyDecimals, getCurrencySymbol);
            return;
        }

        // Clearing the date on a scan hands the field back to SmartScan rather than emptying it, the same way clearing
        // the amount or the merchant does.
        if (!newDate && canEnterScanFieldsManually) {
            clearMoneyRequestCreated(transactionID, shouldUseTransactionDraft(action));
            return;
        }

        setMoneyRequestCreated(transactionID, newDate, shouldUseTransactionDraft(action), transactionHasReceipt);

        if (action !== CONST.IOU.ACTION.EDIT) {
            updateDistanceRateOnExpenseDateChange({
                transactionID,
                transaction,
                newCreated: newDate,
                reportID,
                isPolicyExpenseChat: isPolicyExpenseChatReportUtil(report),
                isTrackExpense,
                policy,
                policyForTrackExpense,
                lastSelectedDistanceRates,
                isDraft: shouldUseTransactionDraft(action),
                personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                getCurrencyDecimals,
            });
        }
    };

    if (!isReadOnly) {
        return (
            <View style={[styles.mh4, styles.mb2]}>
                <DatePicker
                    inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                    value={shouldShowEmptyDate ? '' : iouCreated}
                    defaultValue={format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                    label={translate('common.date')}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    onInputChange={handleDateChange}
                    disabled={didConfirm}
                    errorText={inlineDateErrorText || dateErrorText}
                    shouldDeferShowUntilPositioned
                    // The hint only renders while the date is empty, and `TextInput` drops its right-hand-side
                    // component whenever the clear button can appear, which it can't without a value to clear.
                    shouldHideClearButton={shouldShowEmptyDate}
                    rightHandSideComponent={shouldShowAutomaticHint ? <AutomaticFieldHint /> : undefined}
                    // The calendar icon and the hint share the right-hand side, so the field shows one or the other.
                    // The icon comes back once the user opens the picker, the same way the amount field's buttons do.
                    shouldHideCalendarIcon={shouldShowAutomaticHint}
                    onPickerVisibilityChange={setIsDatePickerOpen}
                />
            </View>
        );
    }

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly}
            title={iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
            description={translate('common.date')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transactionID, reportID, reportActionID)));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly}
            brickRoadIndicator={shouldDisplayFieldError && createdMissing ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={dateErrorText}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DATE_FIELD}
        />
    );
}

export default DateField;
