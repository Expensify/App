import React, {useCallback, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
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
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionDetails, isExpenseRequest, isPolicyExpenseChat} from '@libs/ReportUtils';
import {isInvalidMerchantValue, isValidInputLength} from '@libs/ValidationUtils';
import {setDraftSplitTransaction, setMoneyRequestMerchant, updateMoneyRequestMerchant} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestMerchantForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DiscardChangesConfirmation from './DiscardChangesConfirmation';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepMerchantProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_MERCHANT> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_MERCHANT>;

function IOURequestStepMerchant({
    route: {
        params: {transactionID, reportID, backTo, action, iouType, reportActionID},
    },
    transaction,
    report,
}: IOURequestStepMerchantProps) {
    const policy = usePolicy(report?.policyID);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef, inputRef} = useAutoFocusInput();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && isEditing;
    const merchant = getTransactionDetails(isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction)?.merchant;
    const isEmptyMerchant = isInvalidMerchantValue(merchant);
    const initialMerchant = isEmptyMerchant ? '' : merchant;
    const [currentMerchant, setCurrentMerchant] = useState(initialMerchant);
    const [isSaved, setIsSaved] = useState(false);
    const shouldNavigateAfterSaveRef = useRef(false);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const isMerchantRequired = isPolicyExpenseChat(report) || isExpenseRequest(report) || transaction?.participants?.some((participant) => !!participant.isPolicyExpenseChat);

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    useEffect(() => {
        if (!isSaved || !shouldNavigateAfterSaveRef.current) {
            return;
        }
        shouldNavigateAfterSaveRef.current = false;
        navigateBack();
    }, [isSaved, navigateBack]);

    const validate = useCallback(
        (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM> = {};
            const {isValid, byteLength} = isValidInputLength(value.moneyRequestMerchant, CONST.MERCHANT_NAME_MAX_BYTES);

            if (isMerchantRequired && !value.moneyRequestMerchant) {
                errors.moneyRequestMerchant = translate('common.error.fieldRequired');
            } else if (isMerchantRequired && isInvalidMerchantValue(value.moneyRequestMerchant)) {
                errors.moneyRequestMerchant = translate('iou.error.invalidMerchant');
            } else if (!isValid) {
                errors.moneyRequestMerchant = translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES);
            }

            return errors;
        },
        [isMerchantRequired, translate],
    );

    const updateMerchantRef = (value: string) => {
        setCurrentMerchant(value);
    };

    const updateMerchant = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM>) => {
        const newMerchant = value.moneyRequestMerchant?.trim();

        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {merchant: newMerchant});
            setIsSaved(true);
            shouldNavigateAfterSaveRef.current = true;
            return;
        }

        if (newMerchant === merchant || (newMerchant === '' && merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)) {
            setIsSaved(true);
            shouldNavigateAfterSaveRef.current = true;
            return;
        }
        setMoneyRequestMerchant(transactionID, newMerchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, !isEditing);
        if (isEditing) {
            updateMoneyRequestMerchant({
                transactionID,
                transactionThreadReport: report,
                parentReport,
                value: newMerchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                policy,
                policyTagList: policyTags,
                policyCategories,
                currentUserAccountIDParam,
                currentUserEmailParam,
                isASAPSubmitBetaEnabled,
                parentReportNextStep,
            });
        }
        setIsSaved(true);
        shouldNavigateAfterSaveRef.current = true;
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.merchant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepMerchant"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM}
                onSubmit={updateMerchant}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                shouldUseStrictHtmlTagValidation
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        valueType="string"
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.MONEY_REQUEST_MERCHANT}
                        name={INPUT_IDS.MONEY_REQUEST_MERCHANT}
                        defaultValue={initialMerchant}
                        onValueChange={updateMerchantRef}
                        label={translate('common.merchant')}
                        accessibilityLabel={translate('common.merchant')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
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
                    if (isSaved) {
                        return false;
                    }
                    return currentMerchant !== initialMerchant;
                }}
            />
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepMerchant));
