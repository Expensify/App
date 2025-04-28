import lodashIsEmpty from 'lodash/isEmpty';
import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidMoneyRequestType, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import {areRequiredFieldsEmpty, getFormattedCreated} from '@libs/TransactionUtils';
import {setDraftSplitTransaction, setMoneyRequestCreated, updateMoneyRequestDate} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';
import type {Report, Transaction} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DATE> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<Transaction>;

    /** The report linked to the transaction */
    report: OnyxEntry<Report>;
};

function IOURequestStepDate({
    route: {
        params: {action, iouType, reportID, backTo, reportActionID, transactionID},
    },
    transaction,
    report,
}: IOURequestStepDateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const reportActionsReportID = useMemo(() => {
        let actionsReportID;
        if (action === CONST.IOU.ACTION.EDIT) {
            actionsReportID = iouType === CONST.IOU.TYPE.SPLIT ? report?.reportID : report?.parentReportID;
        }
        return actionsReportID;
    }, [action, iouType, report?.reportID, report?.parentReportID]);
    const [reportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsReportID}`, {
        canEvict: false,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        selector: (reportActions) => reportActions?.[`${report?.parentReportActionID || reportActionID}`],
    });
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && isEditing;
    const currentCreated = isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? getFormattedCreated(splitDraftTransaction) : getFormattedCreated(transaction);
    const canEditingSplitBill = isEditingSplitBill && session && reportAction && session.accountID === reportAction.actorAccountID && areRequiredFieldsEmpty(transaction);
    const canEditMoneyRequest = isEditing && canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.DATE);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFound = !isValidMoneyRequestType(iouType) || (isEditing && !canEditMoneyRequest && !canEditingSplitBill);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateDate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM>) => {
        const newCreated = value.moneyRequestCreated;

        // Only update created if it has changed
        if (newCreated === currentCreated) {
            navigateBack();
            return;
        }

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, {created: newCreated});
            navigateBack();
            return;
        }

        const isTransactionDraft = shouldUseTransactionDraft(action);

        setMoneyRequestCreated(transactionID, newCreated, isTransactionDraft);

        if (isEditing) {
            updateMoneyRequestDate(transactionID, reportID, newCreated, policy, policyTags, policyCategories);
        }

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.date')}
            onBackButtonPress={navigateBack}
            shouldShowNotFoundPage={shouldShowNotFound}
            shouldShowWrapper
            testID={IOURequestStepDate.displayName}
            includeSafeAreaPaddingBottom
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={updateDate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
            >
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                    label={translate('common.date')}
                    defaultValue={currentCreated}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                    autoFocus
                />
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepDate.displayName = 'IOURequestStepDate';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDate);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDateWithFullTransactionOrNotFound);

export default IOURequestStepDateWithWritableReportOrNotFound;
