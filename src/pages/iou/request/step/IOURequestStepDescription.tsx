import lodashIsEmpty from 'lodash/isEmpty';
import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditMoneyRequest} from '@libs/ReportUtils';
import {areRequiredFieldsEmpty} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {setDraftSplitTransaction, setMoneyRequestDescription, updateMoneyRequestDescription} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestDescriptionForm';
import type * as OnyxTypes from '@src/types/onyx';
import DiscardChangesConfirmation from './DiscardChangesConfirmation';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDescriptionProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DESCRIPTION> & {
    /** Holds data related to Expense view state, rather than the underlying Expense data. */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function IOURequestStepDescription({
    route: {
        params: {action, iouType, reportID, backTo, reportActionID, transactionID},
    },
    transaction,
    report,
}: IOURequestStepDescriptionProps) {
    const policy = usePolicy(report?.policyID);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);
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
        selector: (reportActions) => reportActions?.[report?.parentReportActionID || reportActionID],
    });
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput(true);
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && action === CONST.IOU.ACTION.EDIT;
    const currentDescriptionInMarkdown = Parser.htmlToMarkdown(
        isEditingSplitBill && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction?.comment?.comment ?? '' : transaction?.comment?.comment ?? '',
    );
    const descriptionRef = useRef(currentDescriptionInMarkdown);
    const isSavedRef = useRef(false);

    /**
     * @returns - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM> => {
            const errors = {};

            if (values.moneyRequestComment.length > CONST.DESCRIPTION_LIMIT) {
                addErrorMessage(
                    errors,
                    'moneyRequestComment',
                    translate('common.error.characterLimitExceedCounter', {length: values.moneyRequestComment.length, limit: CONST.DESCRIPTION_LIMIT}),
                );
            }

            return errors;
        },
        [translate],
    );

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateDescriptionRef = (value: string) => {
        descriptionRef.current = value;
    };

    const updateComment = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM>) => {
        if (!transaction?.transactionID) {
            return;
        }

        isSavedRef.current = true;
        const newComment = value.moneyRequestComment.trim();

        // Only update comment if it has changed
        if (newComment === currentDescriptionInMarkdown) {
            navigateBack();
            return;
        }

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            setDraftSplitTransaction(transaction?.transactionID, {comment: newComment});
            navigateBack();
            return;
        }
        const isTransactionDraft = shouldUseTransactionDraft(action);

        setMoneyRequestDescription(transaction?.transactionID, newComment, isTransactionDraft);

        if (action === CONST.IOU.ACTION.EDIT) {
            updateMoneyRequestDescription(transaction?.transactionID, reportID, newComment, policy, policyTags, policyCategories);
        }

        navigateBack();
    };

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && areRequiredFieldsEmpty(transaction);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = isEditing && (isSplitBill ? !canEditSplitBill : !isMoneyRequestAction(reportAction) || !canEditMoneyRequest(reportAction));
    const isReportInGroupPolicy = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE;

    return (
        <StepScreenWrapper
            headerTitle={translate('common.description')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepDescription.displayName}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={updateComment}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        valueType="string"
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MONEY_REQUEST_COMMENT}
                        name={INPUT_IDS.MONEY_REQUEST_COMMENT}
                        defaultValue={currentDescriptionInMarkdown}
                        onValueChange={updateDescriptionRef}
                        label={translate('moneyRequestConfirmationList.whatsItFor')}
                        accessibilityLabel={translate('moneyRequestConfirmationList.whatsItFor')}
                        role={CONST.ROLE.PRESENTATION}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        shouldSubmitForm
                        isMarkdownEnabled
                        excludedMarkdownStyles={!isReportInGroupPolicy ? ['mentionReport'] : []}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
            <DiscardChangesConfirmation
                getHasUnsavedChanges={() => {
                    if (isSavedRef.current) {
                        return false;
                    }
                    return descriptionRef.current !== currentDescriptionInMarkdown;
                }}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepDescription.displayName = 'IOURequestStepDescription';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDescriptionWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDescription);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDescriptionWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDescriptionWithFullTransactionOrNotFound);

export default IOURequestStepDescriptionWithWritableReportOrNotFound;
