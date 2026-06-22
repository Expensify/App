import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestCreated, updateDistanceRateOnExpenseDateChange} from '@libs/actions/IOU/MoneyRequest';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyExpenseChat as isPolicyExpenseChatReportUtil} from '@libs/ReportUtils';
import {setDraftSplitTransaction} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';
import {dateStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type DateFieldProps = {
    shouldDisplayFieldError: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    formError: string;
    clearFormErrors: (errors: string[]) => void;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
};

function DateField({shouldDisplayFieldError, didConfirm, isReadOnly, formError, clearFormErrors, transactionID, action, iouType, reportID, reportActionID}: DateFieldProps) {
    const {isEditingSplitBill} = useConfirmationFields();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const policyForTrackExpense = usePolicy(isTrackExpense ? policyForMovingExpensesID : undefined);

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const policy = usePolicy(report?.policyID);

    const dateState = useTransactionSelector(transactionID, dateStateSelector);
    const transaction = useTransactionSelector(transactionID, (t) => t);

    const iouCreated = dateState?.iouCreated ?? '';
    const createdMissing = dateState?.isMissing ?? true;
    const transactionHasReceipt = dateState?.hasReceipt ?? false;

    const dateErrorText = shouldDisplayFieldError && createdMissing ? translate('common.error.enterDate') : '';

    const inlineDateErrorText = formError === 'common.error.fieldRequired' && createdMissing ? translate('common.error.fieldRequired') : '';

    const handleDateChange = (newDate: string) => {
        if (!transactionID) {
            return;
        }

        if (newDate === iouCreated) {
            return;
        }

        if (newDate) {
            clearFormErrors(['common.error.fieldRequired']);
        }

        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {created: newDate});
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
            });
        }
    };

    if (!isReadOnly) {
        return (
            <View style={[styles.mh4, styles.mb2]}>
                <DatePicker
                    inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                    value={iouCreated}
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

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
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
