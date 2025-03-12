import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getTransactionDetails, isExpenseRequest, isPolicyExpenseChat} from '@libs/ReportUtils';
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
        params: {transactionID, reportID, backTo, action, iouType},
    },
    transaction,
    report,
}: IOURequestStepMerchantProps) {
    const policy = usePolicy(report?.policyID);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
    const isEditingSplitBill = iouType === CONST.IOU.TYPE.SPLIT && isEditing;
    const merchant = getTransactionDetails(isEditingSplitBill && !isEmptyObject(splitDraftTransaction) ? splitDraftTransaction : transaction)?.merchant;
    const isEmptyMerchant = merchant === '' || merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const initialMerchant = isEmptyMerchant ? '' : merchant;
    const merchantRef = useRef(initialMerchant);
    const isSavedRef = useRef(false);

    const isMerchantRequired = isPolicyExpenseChat(report) || isExpenseRequest(report) || transaction?.participants?.some((participant) => !!participant.isPolicyExpenseChat);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const validate = useCallback(
        (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM> = {};

            if (isMerchantRequired && !value.moneyRequestMerchant) {
                errors.moneyRequestMerchant = translate('common.error.fieldRequired');
            } else if (value.moneyRequestMerchant.length > CONST.MERCHANT_NAME_MAX_LENGTH) {
                errors.moneyRequestMerchant = translate('common.error.characterLimitExceedCounter', {
                    length: value.moneyRequestMerchant.length,
                    limit: CONST.MERCHANT_NAME_MAX_LENGTH,
                });
            }

            return errors;
        },
        [isMerchantRequired, translate],
    );

    const updateMerchantRef = (value: string) => {
        merchantRef.current = value;
    };

    const updateMerchant = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM>) => {
        isSavedRef.current = true;
        const newMerchant = value.moneyRequestMerchant?.trim();

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, {merchant: newMerchant});
            navigateBack();
            return;
        }

        // In case the merchant hasn't been changed, do not make the API request.
        // In case the merchant has been set to empty string while current merchant is partial, do nothing too.
        if (newMerchant === merchant || (newMerchant === '' && merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT)) {
            navigateBack();
            return;
        }
        // When creating/editing an expense, newMerchant can be blank so we fall back on PARTIAL_TRANSACTION_MERCHANT
        setMoneyRequestMerchant(transactionID, newMerchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, !isEditing);
        if (isEditing) {
            updateMoneyRequestMerchant(transactionID, reportID, newMerchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, policy, policyTags, policyCategories);
        }
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.merchant')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepMerchant.displayName}
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM}
                onSubmit={updateMerchant}
                validate={validate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
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
                getHasUnsavedChanges={() => {
                    if (isSavedRef.current) {
                        return false;
                    }
                    return merchantRef.current !== initialMerchant;
                }}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepMerchant.displayName = 'IOURequestStepMerchant';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepMerchant));
