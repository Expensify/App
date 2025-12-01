import lodashIsEmpty from 'lodash/isEmpty';
import React, {useCallback, useMemo, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {addErrorMessage} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getPersonalPolicy} from '@libs/PolicyUtils';
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
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: true});

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`, {canBeMissing: true});

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef, inputRef} = useAutoFocusInput(true);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);

    const currentDescriptionInMarkdown = useMemo(() => {
        if (!isTransactionDraft || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) {
            return Parser.htmlToMarkdown(isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? (splitDraftTransaction?.comment?.comment ?? '') : (transaction?.comment?.comment ?? ''));
        }
        return isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? (splitDraftTransaction?.comment?.comment ?? '') : (transaction?.comment?.comment ?? '');
    }, [isTransactionDraft, iouType, isEditingSplit, splitDraftTransaction, transaction?.comment?.comment]);

    const descriptionRef = useRef(currentDescriptionInMarkdown);
    const isSavedRef = useRef(false);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();

    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(transaction?.transactionID)}`, {canBeMissing: true});

    const movingExpensesPolicy = usePolicy(policyForMovingExpensesID);
    const [movingExpensesPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyForMovingExpensesID}`, {canBeMissing: true});

    const isDescriptionRequired = useMemo(() => {
        const categoriesToUse = policyCategories ?? movingExpensesPolicyCategories;
        const policyToUse = policy ?? movingExpensesPolicy;

        return isCategoryDescriptionRequired(categoriesToUse, transaction?.category ?? transactionDraft?.category, policyToUse?.areRulesEnabled);
    }, [policyCategories, movingExpensesPolicyCategories, transaction?.category, transactionDraft?.category, policy, movingExpensesPolicy]);

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

            if (isDescriptionRequired && !values.moneyRequestComment) {
                addErrorMessage(errors, INPUT_IDS.MONEY_REQUEST_COMMENT, translate('common.error.fieldRequired'));
            }

            return errors;
        },
        [isDescriptionRequired, translate],
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
        if (isEditingSplit) {
            setDraftSplitTransaction(transaction?.transactionID, splitDraftTransaction, {comment: newComment});
            navigateBack();
            return;
        }

        setMoneyRequestDescription(transaction?.transactionID, newComment, isTransactionDraft);

        if (action === CONST.IOU.ACTION.EDIT) {
            updateMoneyRequestDescription(
                transaction?.transactionID,
                reportID,
                newComment,
                policy,
                policyTags,
                policyCategories,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
            );
        }

        navigateBack();
    };

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const isReportInGroupPolicy = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE && getPersonalPolicy()?.id !== report.policyID;
    const getDescriptionHint = () => {
        return transaction?.category && policyCategories ? (policyCategories[transaction?.category]?.commentHint ?? '') : '';
    };

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
                shouldHideFixErrorsAlert
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
                        type="markdown"
                        excludedMarkdownStyles={!isReportInGroupPolicy ? ['mentionReport'] : []}
                        ref={inputCallbackRef}
                        hint={getDescriptionHint()}
                    />
                </View>
            </FormProvider>
            <DiscardChangesConfirmation
                onCancel={() => {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        inputRef.current?.focus();
                    });
                }}
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
