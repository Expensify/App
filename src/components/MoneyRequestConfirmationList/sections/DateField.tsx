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

import {setMoneyRequestCreated, updateDistanceRateOnExpenseDateChange} from '@libs/actions/IOU/MoneyRequest';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyExpenseChat as isPolicyExpenseChatReportUtil} from '@libs/ReportUtils';

import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';

import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import {dateStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type DateFieldProps = {
    shouldDisplayFieldError: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    isNewManualExpenseFlowEnabled: boolean;
    formError: string;
    clearFormErrors: (errors: string[]) => void;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
};

function DateField({
    shouldDisplayFieldError,
    didConfirm,
    isReadOnly,
    isNewManualExpenseFlowEnabled,
    formError,
    clearFormErrors,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
}: DateFieldProps) {
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
    // picker stays empty until the user picks one — the same way the amount field starts empty.
    const shouldShowEmptyDate = canEnterScanFieldsManually && !dateState?.isCreatedSet;
    const isDateEmpty = createdMissing || shouldShowEmptyDate;

    const dateErrorText = shouldDisplayFieldError && createdMissing ? translate('common.error.enterDate') : '';

    const inlineDateErrorText = formError === 'common.error.fieldRequired' && isDateEmpty ? translate('common.error.fieldRequired') : '';

    const handleDateChange = (newDate: string) => {
        if (!transactionID) {
            return;
        }

        // While the picker renders empty the persisted date is only a default, so a pick that matches it still has to
        // be written — that write is what marks the date as chosen by the user.
        if (newDate === iouCreated && !shouldShowEmptyDate) {
            return;
        }

        if (newDate) {
            clearFormErrors(['common.error.fieldRequired']);
        }

        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {created: newDate}, getCurrencyDecimals, getCurrencySymbol);
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

    if (isNewManualExpenseFlowEnabled && !isReadOnly) {
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
