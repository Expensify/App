import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {parsePhoneNumber} from '@libs/PhoneNumber';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import {setIssueNewCardStepAndData} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import KeyboardUtils from '@src/utils/keyboard';

import React from 'react';

type PhoneNumberStepProps = {
    /** ID of the policy that the card will be issued under */
    policyID: string | undefined;

    stepNames: readonly string[];
    startStepIndex: number;
};

function PhoneNumberStep({policyID, stepNames, startStepIndex}: PhoneNumberStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const isEditing = issueNewCard?.isEditing;
    const shippingAddress = issueNewCard?.data?.shippingAddress;

    // A number without a country code belongs to the country the card ships to, not the admin's
    const parseShippingPhoneNumber = (phoneNumber: string) => parsePhoneNumber(phoneNumber, {regionCode: shippingAddress?.addressCountry});

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.PHONE_NUMBER], translate);
        if (values.phoneNumber && !parseShippingPhoneNumber(values.phoneNumber).possible) {
            errors.phoneNumber = translate('common.error.phoneNumber');
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        if (!shippingAddress) {
            return;
        }
        KeyboardUtils.dismiss().then(() => {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
                data: {shippingAddress: {...shippingAddress, phoneNumber: parseShippingPhoneNumber(values.phoneNumber).number?.e164 ?? ''}},
                isEditing: false,
                policyID,
            });
        });
    };

    const handleBackButtonPress = () => {
        setIssueNewCardStepAndData({step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.SHIPPING_ADDRESS, isEditing: false, policyID});
    };

    return (
        <InteractiveStepWrapper
            wrapperID="PhoneNumberStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={submit}
                validate={validate}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                addBottomSafeAreaPadding
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mt3]}>{translate('workspace.card.issueNewCard.enterPhoneNumber')}</Text>
                <Text style={[styles.textSupporting, styles.mv3]}>{translate('workspace.card.issueNewCard.phoneNumberDescription')}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.PHONE_NUMBER}
                    label={translate('common.phoneNumber')}
                    aria-label={translate('common.phoneNumber')}
                    role={CONST.ROLE.PRESENTATION}
                    inputMode={CONST.INPUT_MODE.TEL}
                    defaultValue={shippingAddress?.phoneNumber}
                    autoComplete="tel"
                    ref={inputCallbackRef}
                />
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default PhoneNumberStep;
