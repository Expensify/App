import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNavigateBackOnSave from '@hooks/useNavigateBackOnSave';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionDescription from '@hooks/useUpdateTransactionDescription';

import {getCategoryDescriptionHint} from '@libs/CategoryUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Parser from '@libs/Parser';
import {arePolicyRulesEnabled} from '@libs/PolicyUtils';
import shouldForceKeyboardIfAlreadyFocused from '@libs/shouldForceKeyboardIfAlreadyFocused';
import {hasReceipt} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import {setMoneyRequestDescription} from '@userActions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestDescriptionForm';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import lodashIsEmpty from 'lodash/isEmpty';
import React, {useState} from 'react';
import {View} from 'react-native';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import KEYBOARD_SUBMIT_BEHAVIOR from './shouldDismissKeyboardBeforeDescriptionSubmit';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepDescriptionProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESCRIPTION> & {
    /** Holds data related to Expense view state, rather than the underlying Expense data. */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function DynamicIOURequestStepDescription({
    route: {
        params: {action, iouType, reportID, reportActionID, transactionID},
    },
    transaction,
    report,
}: DynamicIOURequestStepDescriptionProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.path);
    const policy = usePolicy(report?.policyID);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const {updateDescription} = useUpdateTransactionDescription({transaction, transactionThreadReport: report});

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {inputCallbackRef, inputRef} = useAutoFocusInput(true);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);

    let currentDescriptionInMarkdown;
    if (!isTransactionDraft || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) {
        currentDescriptionInMarkdown = Parser.htmlToMarkdown(
            isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? (splitDraftTransaction?.comment?.comment ?? '') : (transaction?.comment?.comment ?? ''),
        );
    } else {
        currentDescriptionInMarkdown = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? (splitDraftTransaction?.comment?.comment ?? '') : (transaction?.comment?.comment ?? '');
    }

    const [currentDescription, setCurrentDescription] = useState(currentDescriptionInMarkdown);
    const [isSaved, setIsSaved] = useState(false);
    const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    /**
     * @returns - An object containing the errors for each inputID
     */
    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM> => {
        const errors = {};

        if (values.moneyRequestComment.length > CONST.DESCRIPTION_LIMIT) {
            addErrorMessage(errors, 'moneyRequestComment', translate('common.error.characterLimitExceedCounter', values.moneyRequestComment.length, CONST.DESCRIPTION_LIMIT));
        }

        return errors;
    };

    const {navigateBack, armNavigateBack} = useNavigateBackOnSave(isSaved, backPath);

    const updateDescriptionRef = (value: string) => {
        setCurrentDescription(value);
    };

    const updateComment = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM>) => {
        if (!transaction?.transactionID) {
            return;
        }

        const newComment = value.moneyRequestComment.trim();

        if (newComment === currentDescriptionInMarkdown) {
            setIsSaved(true);
            armNavigateBack();
            return;
        }

        if (isEditingSplit) {
            setDraftSplitTransaction(transaction?.transactionID, splitDraftTransaction ?? transaction, {comment: newComment}, getCurrencyDecimals, getCurrencySymbol);
            setIsSaved(true);
            armNavigateBack();
            return;
        }

        if (action === CONST.IOU.ACTION.EDIT) {
            updateDescription(newComment);
        } else {
            setMoneyRequestDescription(transaction?.transactionID, newComment, isTransactionDraft, hasReceipt(transaction));
        }

        setIsSaved(true);
        armNavigateBack();
    };

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const isReportInGroupPolicy = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE && personalPolicyID !== report.policyID;
    const descriptionHint = getCategoryDescriptionHint(policyCategories, transaction?.category, arePolicyRulesEnabled(policy, policyCategories));

    useDiscardChangesConfirmation({
        onCancel: () => {
            focusComposerWithDelay(inputRef.current)(true, undefined, shouldForceKeyboardIfAlreadyFocused());
        },
        getHasUnsavedChanges: () => {
            if (isSaved) {
                return false;
            }
            return currentDescription !== currentDescriptionInMarkdown;
        },
        onVisibilityChange: setIsDiscardModalVisible,
    });

    return (
        <StepScreenWrapper
            headerTitle={translate('common.description')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepDescription"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                onSubmit={updateComment}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                keyboardSubmitBehavior={KEYBOARD_SUBMIT_BEHAVIOR}
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
                        editable={!isDiscardModalVisible}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        shouldSubmitForm
                        type="markdown"
                        excludedMarkdownStyles={!isReportInGroupPolicy ? ['mentionReport'] : []}
                        ref={inputCallbackRef}
                        hint={descriptionHint}
                        shouldRenderHintAsHTML={!!descriptionHint}
                    />
                </View>
            </FormProvider>
        </StepScreenWrapper>
    );
}

const DynamicIOURequestStepDescriptionWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepDescription);

const DynamicIOURequestStepDescriptionWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepDescriptionWithFullTransactionOrNotFound);

export default DynamicIOURequestStepDescriptionWithWritableReportOrNotFound;
