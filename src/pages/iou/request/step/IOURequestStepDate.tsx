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

    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;
};

type IOURequestStepDateProps = IOURequestStepDateOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<OnyxTypes.Transaction>;
    };

function IOURequestStepDate({
    route: {
        params: {action, iouType, reportID, backTo},
    },
    transaction,
    splitDraftTransaction,
    policy,
    policyTags,
    policyCategories,
}: IOURequestStepDateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && isEditing;
    const currentCreated = isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? TransactionUtils.getCreated(splitDraftTransaction) : TransactionUtils.getCreated(transaction);

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
            IOU.setDraftSplitTransaction(transaction?.transactionID ?? '0', {created: newCreated});
            navigateBack();
            return;
        }

        const isTransactionDraft = action === CONST.IOU.ACTION.CREATE || IOUUtils.isMovingTransactionFromTrackExpense(action);

        IOU.setMoneyRequestCreated(transaction?.transactionID ?? '0', newCreated, isTransactionDraft);

        if (isEditing) {
            IOU.updateMoneyRequestDate(transaction?.transactionID ?? '0', reportID, newCreated, policy, policyTags, policyCategories);
        }

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.date')}
            onBackButtonPress={navigateBack}
            shouldShowNotFoundPage={!IOUUtils.isValidMoneyRequestType(iouType)}
            shouldShowWrapper
            testID={IOURequestStepDate.displayName}
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
            const transactionID = route?.params.transactionID ?? 0;
            return `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`;
        },
    },
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
    },
    policyTags: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
    },
})(IOURequestStepDate);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDateWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDateWithWritableReportOrNotFound);

export default IOURequestStepDateWithFullTransactionOrNotFound;
