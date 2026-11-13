import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useMoneyRequestUpdateParams from '@hooks/useMoneyRequestUpdateParams';
import useNavigateBackOnSave from '@hooks/useNavigateBackOnSave';
import useOnyx from '@hooks/useOnyx';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionMerchant from '@hooks/useUpdateTransactionMerchant';

import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import {isMerchantRequired} from '@libs/MoneyRequestUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {hasReceipt} from '@libs/TransactionUtils';
import {getMerchantError, getMerchantErrorMessage, isInvalidMerchantValue} from '@libs/ValidationUtils';

import {clearMoneyRequestMerchant, setMoneyRequestMerchant} from '@userActions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestMerchantForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepMerchantProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_MERCHANT> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_MERCHANT>;

function DynamicIOURequestStepMerchant({
    route: {
        params: {transactionID, reportID, action, iouType, reportActionID},
    },
    transaction,
    report,
}: DynamicIOURequestStepMerchantProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_MERCHANT.path);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const updateParams = useMoneyRequestUpdateParams(transactionID, report);
    const {updateMerchant: updateSavedExpenseMerchant} = useUpdateTransactionMerchant({transaction, updateParams});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {inputCallbackRef, inputRef} = useAutoFocusInput();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && isEditing;
    const merchant = getTransactionDetails(isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction)?.merchant;
    const isEmptyMerchant = isInvalidMerchantValue(merchant);
    const initialMerchant = isEmptyMerchant ? '' : merchant;
    const [currentMerchant, setCurrentMerchant] = useState(initialMerchant);
    const [isSaved, setIsSaved] = useState(false);
    const [isDiscardModalVisible, setIsDiscardModalVisible] = useState(false);

    const isMerchantFieldRequired = isMerchantRequired(report, transaction);

    const {navigateBack, armNavigateBack} = useNavigateBackOnSave(isSaved, backPath);

    const validate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM> = {};
        const merchantError = getMerchantError(value.moneyRequestMerchant, isMerchantFieldRequired);

        if (merchantError) {
            errors.moneyRequestMerchant = getMerchantErrorMessage(translate, merchantError);
        }

        return errors;
    };

    const updateMerchantRef = (value: string) => {
        setCurrentMerchant(value);
    };

    const updateMerchant = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM>) => {
        const newMerchant = value.moneyRequestMerchant?.trim();

        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction ?? transaction, {merchant: newMerchant}, getCurrencyDecimals, getCurrencySymbol);
            setIsSaved(true);
            armNavigateBack();
            return;
        }

        if (newMerchant === '' && isInvalidMerchantValue(merchant)) {
            setIsSaved(true);
            armNavigateBack();
            clearMoneyRequestMerchant(transactionID);
            return;
        }
        if (newMerchant === merchant || (newMerchant === '' && isInvalidMerchantValue(merchant))) {
            setIsSaved(true);
            armNavigateBack();
            return;
        }
        // updateMoneyRequestMerchant's optimisticData already sets merchant on TRANSACTION{id},
        // also calling setMoneyRequestMerchant would trigger a redundant Onyx commit and
        // re-render every subscriber of that key for nothing.
        if (isEditing) {
            updateSavedExpenseMerchant(newMerchant);
        } else if (!newMerchant) {
            clearMoneyRequestMerchant(transactionID);
        } else {
            setMoneyRequestMerchant(transactionID, newMerchant, true, hasReceipt(transaction));
        }
        setIsSaved(true);
        armNavigateBack();
    };

    useDiscardChangesConfirmation({
        onCancel: () => {
            focusComposerWithDelay(inputRef.current)(true);
        },
        getHasUnsavedChanges: () => {
            if (isSaved) {
                return false;
            }
            return currentMerchant !== initialMerchant;
        },
        onVisibilityChange: setIsDiscardModalVisible,
    });

    return (
        <StepScreenWrapper
            headerTitle={translate('common.merchant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="DynamicIOURequestStepMerchant"
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
                        editable={!isDiscardModalVisible}
                        ref={inputCallbackRef}
                    />
                </View>
            </FormProvider>
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(DynamicIOURequestStepMerchant));
