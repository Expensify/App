import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionDate from '@hooks/useUpdateTransactionDate';

import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyExpenseChat as isPolicyExpenseChatReportUtil} from '@libs/ReportUtils';
import {getFormattedCreated, hasReceipt} from '@libs/TransactionUtils';

import {setMoneyRequestCreated, updateDistanceRateOnExpenseDateChange} from '@userActions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepDateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DATE> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<Transaction>;

    /** The report linked to the transaction */
    report: OnyxEntry<Report>;
};

function DynamicIOURequestStepDate({
    route: {
        params: {action, iouType, reportID, reportActionID, transactionID},
    },
    transaction,
    report,
}: DynamicIOURequestStepDateProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DATE.path);
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(report?.policyID);
    const personalPolicy = usePersonalPolicy();
    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const policyForTrackExpense = usePolicy(isTrackExpense ? policyForMovingExpensesID : undefined);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const {updateDate: updateSavedExpenseDate} = useUpdateTransactionDate({transaction, transactionThreadReport: report, isTrackExpense});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isSplitExpense = iouType === CONST.IOU.TYPE.SPLIT_EXPENSE;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplit = (isSplitBill || isSplitExpense) && isEditing;
    const currentCreated = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? getFormattedCreated(splitDraftTransaction) : getFormattedCreated(transaction);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    const shouldShowNotFound = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    const saveAndNavigateBack = () => {
        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    };

    const updateDate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM>) => {
        const newCreated = value.moneyRequestCreated;

        // Only update created if it has changed
        if (newCreated === currentCreated) {
            saveAndNavigateBack();
            return;
        }

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplit) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction ?? transaction, {created: newCreated}, getCurrencyDecimals, getCurrencySymbol);
            saveAndNavigateBack();
            return;
        }

        const isTransactionDraft = shouldUseTransactionDraft(action);

        if (isEditing) {
            updateSavedExpenseDate(newCreated);
        } else {
            setMoneyRequestCreated(transactionID, newCreated, isTransactionDraft, hasReceipt(transaction));

            updateDistanceRateOnExpenseDateChange({
                transactionID,
                transaction,
                newCreated,
                reportID,
                isPolicyExpenseChat: isPolicyExpenseChatReportUtil(report),
                isTrackExpense,
                policy,
                policyForTrackExpense,
                lastSelectedDistanceRates,
                isDraft: isTransactionDraft,
                personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                getCurrencyDecimals,
            });
        }

        saveAndNavigateBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM> = {};
        if (!values[INPUT_IDS.MONEY_REQUEST_CREATED] || values[INPUT_IDS.MONEY_REQUEST_CREATED] === '') {
            errors[INPUT_IDS.MONEY_REQUEST_CREATED] = translate('common.error.fieldRequired');
        }
        return errors;
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.date')}
            onBackButtonPress={navigateBack}
            shouldShowNotFoundPage={shouldShowNotFound}
            shouldShowWrapper
            testID="DynamicIOURequestStepDate"
            includeSafeAreaPaddingBottom
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={updateDate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                validate={validate}
            >
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                    label={translate('common.date')}
                    defaultValue={currentCreated}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    autoFocus
                />
            </FormProvider>
        </StepScreenWrapper>
    );
}

const DynamicIOURequestStepDateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepDate);

const DynamicIOURequestStepDateWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepDateWithFullTransactionOrNotFound);

export default DynamicIOURequestStepDateWithWritableReportOrNotFound;
