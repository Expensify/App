import AddressSearch from '@components/AddressSearch';
import CountrySelector from '@components/CountrySelector';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import ValuePicker from '@components/ValuePicker';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setIssueNewCardStepAndData} from '@libs/actions/Card';
import {getStreetLines} from '@libs/PersonalDetailsUtils';
import {getCountryZipRegexDetails, getFieldRequiredErrors, isValidLegalName, isValidZipCodeForCountry} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import KeyboardUtils from '@src/utils/keyboard';

import React from 'react';
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
            if (!isValidLegalName(name)) {
                errors[nameInputID] = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (name.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                errors[nameInputID] = translate('common.error.characterLimitExceedCounter', name.length, CONST.LEGAL_NAME.MAX_LENGTH);
            }
        }
        for (const addressInputID of [INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.ADDRESS_LINE_2, INPUT_IDS.CITY] as const) {
            const addressPart = values[addressInputID] ?? '';
            if (addressPart.length > CONST.FORM_CHARACTER_LIMIT) {
                errors[addressInputID] = translate('common.error.characterLimitExceedCounter', addressPart.length, CONST.FORM_CHARACTER_LIMIT);
            }
        }
        if (values.zipPostCode && !isValidZipCodeForCountry(values.zipPostCode, values.country)) {
            errors.zipPostCode = translate('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails(values.country)?.samples);
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        KeyboardUtils.dismiss().then(() => {
            setIssueNewCardStepAndData({
                step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION,
                data: {
                    shippingAddress:
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
                            : undefined,
                },
                isEditing: false,
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
            stepNames={stepNames}
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
                enabledWhenOffline
                addBottomSafeAreaPadding
            >
                {({inputValues}) => {
                    const isEnteringAddress = inputValues.shippingAddressOption === CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS;
                    return (
                        <>
                            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.card.issueNewCard.enterShippingAddress')}</Text>
                            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.shippingAddressDescription')}</Text>
                            <InputWrapper
                                InputComponent={ValuePicker}
                                inputID={INPUT_IDS.SHIPPING_ADDRESS_OPTION}
                                label={translate('workspace.card.issueNewCard.enterShippingAddress')}
                                defaultValue={shippingAddress ? CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS : CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.PROMPT_CARDHOLDER}
                                items={[
                                    {
                                        value: CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.PROMPT_CARDHOLDER,
                                        label: translate('workspace.card.issueNewCard.promptCardholder'),
                                        description: translate('workspace.card.issueNewCard.promptCardholderDescription'),
                                        keyForList: CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.PROMPT_CARDHOLDER,
                                        isSelected: !isEnteringAddress,
                                    },
                                    {
                                        value: CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS,
                                        label: translate('workspace.card.issueNewCard.enterAddress'),
                                        description: translate('workspace.card.issueNewCard.enterAddressDescription'),
                                        keyForList: CONST.EXPENSIFY_CARD.SHIPPING_ADDRESS_OPTION.ENTER_ADDRESS,
                                        isSelected: isEnteringAddress,
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
                                    <InputWrapper
                                        InputComponent={AddressSearch}
                                        inputID={INPUT_IDS.ADDRESS_LINE_1}
                                        label={translate('common.addressLine', 1)}
                                        defaultValue={street1}
                                        renamedInputKeys={{
                                            street: INPUT_IDS.ADDRESS_LINE_1,
                                            street2: INPUT_IDS.ADDRESS_LINE_2,
                                            city: INPUT_IDS.CITY,
                                            state: INPUT_IDS.STATE,
                                            zipCode: INPUT_IDS.ZIP_POST_CODE,
                                            country: INPUT_IDS.COUNTRY,
                                        }}
                                        autoComplete="address-line1"
                                    />
                                    <View style={styles.formSpaceVertical} />
                                    <InputWrapper
                                        InputComponent={TextInput}
                                        inputID={INPUT_IDS.ADDRESS_LINE_2}
                                        label={translate('common.addressLine', 2)}
                                        aria-label={translate('common.addressLine', 2)}
                                        role={CONST.ROLE.PRESENTATION}
                                        defaultValue={street2}
                                        spellCheck={false}
                                        autoComplete="address-line2"
                                    />
                                    <View style={styles.formSpaceVertical} />
                                    <View style={styles.mhn5}>
                                        <InputWrapper
                                            InputComponent={CountrySelector}
                                            inputID={INPUT_IDS.COUNTRY}
                                            defaultValue={shippingAddress?.addressCountry ?? CONST.COUNTRY.US}
                                        />
                                    </View>
                                    <View style={styles.formSpaceVertical} />
                                    {inputValues.country === CONST.COUNTRY.US ? (
                                        <View style={styles.mhn5}>
                                            <InputWrapper
                                                InputComponent={StateSelector}
                                                inputID={INPUT_IDS.STATE}
                                                defaultValue={shippingAddress?.addressState}
                                            />
                                        </View>
                                    ) : (
                                        <InputWrapper
                                            InputComponent={TextInput}
                                            inputID={INPUT_IDS.STATE}
                                            label={translate('common.stateOrProvince')}
                                            aria-label={translate('common.stateOrProvince')}
                                            role={CONST.ROLE.PRESENTATION}
                                            defaultValue={shippingAddress?.addressState}
                                            spellCheck={false}
                                        />
                                    )}
                                    <View style={styles.formSpaceVertical} />
                                    <InputWrapper
                                        InputComponent={TextInput}
                                        inputID={INPUT_IDS.CITY}
                                        label={translate('common.city')}
                                        aria-label={translate('common.city')}
                                        role={CONST.ROLE.PRESENTATION}
                                        defaultValue={shippingAddress?.addressCity}
                                        spellCheck={false}
                                    />
                                    <View style={styles.formSpaceVertical} />
                                    <InputWrapper
                                        InputComponent={TextInput}
                                        inputID={INPUT_IDS.ZIP_POST_CODE}
                                        label={translate('common.zipPostCode')}
                                        aria-label={translate('common.zipPostCode')}
                                        role={CONST.ROLE.PRESENTATION}
                                        autoCapitalize="characters"
                                        defaultValue={shippingAddress?.addressZip}
                                        hint={translate('common.zipCodeExampleFormat', getCountryZipRegexDetails(inputValues.country)?.samples ?? '')}
                                        autoComplete="postal-code"
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
