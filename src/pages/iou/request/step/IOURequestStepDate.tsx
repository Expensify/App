import lodashIsEmpty from 'lodash/isEmpty';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';
import type * as OnyxTypes from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDateOnyxProps = {
    /** The draft transaction that holds data to be persisted on the current transaction */
    splitDraftTransaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The actions from the parent report */
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
};

type IOURequestStepDateProps = IOURequestStepDateOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DATE> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<OnyxTypes.Transaction>;

        /** The report linked to the transaction */
        report: OnyxEntry<Report>;
    };

function IOURequestStepDate({
    route: {
        params: {action, iouType, reportID, backTo, reportActionID},
    },
    transaction,
    splitDraftTransaction,
    policy,
    policyTags,
    policyCategories,
    reportActions,
    report,
    session,
}: IOURequestStepDateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && isEditing;
    const currentCreated =
        isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? TransactionUtils.getFormattedCreated(splitDraftTransaction) : TransactionUtils.getFormattedCreated(transaction);
    const parentReportAction = reportActions?.[isEditingSplitBill ? reportActionID : report?.parentReportActionID];
    const canEditingSplitBill =
        isEditingSplitBill && session && parentReportAction && session.accountID === parentReportAction.actorAccountID && TransactionUtils.areRequiredFieldsEmpty(transaction);
    const canEditMoneyRequest = isEditing && ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.DATE);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFound = !IOUUtils.isValidMoneyRequestType(iouType) || (isEditing && !canEditMoneyRequest && !canEditingSplitBill);

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
            IOU.setDraftSplitTransaction(transaction?.transactionID, {created: newCreated});
            navigateBack();
            return;
        }

        const isTransactionDraft = IOUUtils.shouldUseTransactionDraft(action);

        IOU.setMoneyRequestCreated(transaction?.transactionID, newCreated, isTransactionDraft);

        if (isEditing) {
            IOU.updateMoneyRequestDate(transaction?.transactionID, reportID, newCreated, policy, policyTags, policyCategories);
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
            includeSafeAreaPaddingBottom={false}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={updateDate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                    label={translate('common.date')}
                    defaultValue={currentCreated}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                />
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepDate.displayName = 'IOURequestStepDate';

const IOURequestStepDateWithOnyx = withOnyx<IOURequestStepDateProps, IOURequestStepDateOnyxProps>({
    splitDraftTransaction: {
        key: ({route}) => {
            const transactionID = route?.params.transactionID;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
        },
    },
    reportActions: {
        key: ({
            route: {
                params: {action, iouType},
            },
            report,
        }) => {
            let reportID;
            if (action === CONST.IOU.ACTION.EDIT) {
                reportID = iouType === CONST.IOU.TYPE.SPLIT ? report?.reportID : report?.parentReportID;
            }
            return `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        },
        canEvict: false,
    },
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : undefined}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : undefined}`,
    },
    policyTags: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : undefined}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(IOURequestStepDate);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDateWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDateWithFullTransactionOrNotFound);

export default IOURequestStepDateWithWritableReportOrNotFound;
