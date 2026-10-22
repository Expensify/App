import AddressFields from '@components/AddressFields';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {openIssueNewCardShippingAddressStep, setIssueNewCardStepAndData} from '@libs/actions/Card';
import {shouldShowPhoneNumberStep} from '@libs/CardUtils';
import {getStreetLines} from '@libs/PersonalDetailsUtils';
import {doesContainReservedWord, getAddressFieldErrors, getFieldRequiredErrors, isValidDisplayName} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import KeyboardUtils from '@src/utils/keyboard';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type ShippingAddressStepProps = {
    /** ID of the policy that the card will be issued under */
    policyID: string | undefined;

    stepNames: readonly string[];
    startStepIndex: number;
};

const REQUIRED_ADDRESS_FIELDS = [
    INPUT_IDS.LEGAL_FIRST_NAME,
    INPUT_IDS.LEGAL_LAST_NAME,
    INPUT_IDS.ADDRESS_LINE_1,
    INPUT_IDS.CITY,
    INPUT_IDS.STATE,
    INPUT_IDS.COUNTRY,
    INPUT_IDS.ZIP_POST_CODE,
];

function ShippingAddressStep({policyID, stepNames, startStepIndex}: ShippingAddressStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const isEditing = issueNewCard?.isEditing;
    const shippingAddress = issueNewCard?.data?.shippingAddress;
    const [street1, street2] = getStreetLines(shippingAddress?.addressStreet);
    const assigneeEmail = issueNewCard?.data?.assigneeEmail;
    const defaultOption = shippingAddress ? CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS : CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.PROMPT_CARDHOLDER;
    const defaultCountry = shippingAddress?.addressCountry ?? CONST.COUNTRY.US;
    const [selectedOption, setSelectedOption] = useState<string>(defaultOption);

    // The phone number step follows when the admin enters an address for a cardholder without a phone number
    const stepNamesWithoutPhoneNumber = shouldShowPhoneNumberStep(issueNewCard) ? stepNames.slice(0, -1) : stepNames;
    const isPhoneNumberStepNext = selectedOption === CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS && issueNewCard?.hasAssigneePhoneNumber !== true;
    const shownStepNames = isPhoneNumberStepNext ? [...stepNamesWithoutPhoneNumber, String(stepNamesWithoutPhoneNumber.length + 1)] : stepNamesWithoutPhoneNumber;

    useEffect(() => {
        openIssueNewCardShippingAddressStep(policyID, assigneeEmail);
    }, [policyID, assigneeEmail]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> => {
        if (values.shippingAddressOption !== CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS) {
            return {};
        }

        const errors = getFieldRequiredErrors(values, REQUIRED_ADDRESS_FIELDS, translate);
        for (const nameInputID of [INPUT_IDS.LEGAL_FIRST_NAME, INPUT_IDS.LEGAL_LAST_NAME] as const) {
            const name = values[nameInputID];
            if (!name) {
                continue;
            }
            if (!isValidDisplayName(name)) {
                errors[nameInputID] = translate('privatePersonalDetails.error.cannotIncludeCommaOrSemicolon');
            } else if (name.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                errors[nameInputID] = translate('common.error.characterLimitExceedCounter', name.length, CONST.LEGAL_NAME.MAX_LENGTH);
            } else if (doesContainReservedWord(name, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                errors[nameInputID] = translate('personalDetails.error.containsReservedWord');
            }
        }
        return {...errors, ...getAddressFieldErrors(values, translate)};
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        const enteredShippingAddress =
            values.shippingAddressOption === CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS && values.country
                ? {
                      legalFirstName: values.legalFirstName.trim(),
                      legalLastName: values.legalLastName.trim(),
                      addressStreet: [values.addressLine1.trim(), values.addressLine2.trim()].filter(Boolean).join('\n'),
                      addressCity: values.city.trim(),
                      addressState: values.state.trim(),
                      addressZip: values.zipPostCode.trim().toUpperCase(),
                      addressCountry: values.country,
                  }
                : null;
        const hasEnteredPhoneNumber = !!isEditing && !!shippingAddress?.phoneNumber;
        const isPhoneNumberNeeded = !!enteredShippingAddress && issueNewCard?.hasAssigneePhoneNumber !== true && !hasEnteredPhoneNumber;
        KeyboardUtils.dismiss().then(() => {
            setIssueNewCardStepAndData({
                step: isPhoneNumberNeeded ? CONST.EXPENSIFY_CARD.STEP.PHONE_NUMBER : CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
                data: {shippingAddress: enteredShippingAddress},
                isEditing: isPhoneNumberNeeded && !!isEditing,
                policyID,
            });
        });
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
                isEditing: false,
                policyID,
            });
            return;
        }
        setIssueNewCardStepAndData({
            step: CONST.EXPENSIFY_CARD.STEP.CARD_NAME,
            policyID,
        });
    };

    return (
        <InteractiveStepWrapper
            wrapperID="ShippingAddressStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={shownStepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FormProvider
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                shouldHideFixErrorsAlert
                onSubmit={submit}
                style={[styles.flex1]}
                submitButtonStyles={[styles.mh5]}
                validate={validate}
                // The address inputs are hidden when the cardholder enters their own address, so their values aren't checked
                allowHTML={selectedOption !== CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS}
                enabledWhenOffline
                addBottomSafeAreaPadding
            >
                {({inputValues}) => {
                    // An input only fills inputValues once it mounts, so its default stands in until then
                    const isEnteringAddress = (inputValues.shippingAddressOption ?? defaultOption) === CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS;
                    return (
                        <>
                            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.card.issueNewCard.enterShippingAddress')}</Text>
                            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.shippingAddressDescription')}</Text>
                            <InputWrapper
                                InputComponent={ValuePicker}
                                inputID={INPUT_IDS.SHIPPING_ADDRESS_OPTION}
                                label={translate('workspace.card.issueNewCard.enterShippingAddress')}
                                defaultValue={defaultOption}
                                onValueChange={(value) => {
                                    if (typeof value !== 'string') {
                                        return;
                                    }
                                    setSelectedOption(value);
                                }}
                                items={[
                                    {
                                        value: CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.PROMPT_CARDHOLDER,
                                        label: translate('workspace.card.issueNewCard.promptCardholder'),
                                        description: translate('workspace.card.issueNewCard.promptCardholderDescription'),
                                    },
                                    {
                                        value: CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS,
                                        label: translate('workspace.card.issueNewCard.enterAddress'),
                                        description: translate('workspace.card.issueNewCard.enterAddressDescription'),
                                    },
                                ]}
                                shouldShowModal={false}
                                addBottomSafeAreaPadding={false}
                                disableKeyboardShortcuts
                                alternateNumberOfSupportedLines={2}
                            />
                            {isEnteringAddress && (
                                <View style={[styles.mh5, styles.mt3]}>
                                    <InputWrapper
                                        InputComponent={TextInput}
                                        inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                                        label={translate('common.firstName')}
                                        aria-label={translate('common.firstName')}
                                        role={CONST.ROLE.PRESENTATION}
                                        defaultValue={shippingAddress?.legalFirstName}
                                        spellCheck={false}
                                        autoComplete="given-name"
                                    />
                                    <View style={styles.formSpaceVertical} />
                                    <InputWrapper
                                        InputComponent={TextInput}
                                        inputID={INPUT_IDS.LEGAL_LAST_NAME}
                                        label={translate('common.lastName')}
                                        aria-label={translate('common.lastName')}
                                        role={CONST.ROLE.PRESENTATION}
                                        defaultValue={shippingAddress?.legalLastName}
                                        spellCheck={false}
                                        autoComplete="family-name"
                                    />
                                    <View style={styles.formSpaceVertical} />
                                    <AddressFields
                                        street1={street1}
                                        street2={street2}
                                        city={inputValues.city ?? shippingAddress?.addressCity}
                                        state={inputValues.state ?? shippingAddress?.addressState}
                                        zip={inputValues.zipPostCode ?? shippingAddress?.addressZip}
                                        defaultCountry={defaultCountry}
                                        country={inputValues.country ?? defaultCountry}
                                    />
                                </View>
                            )}
                        </>
                    );
                }}
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default ShippingAddressStep;
