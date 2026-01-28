import {useRoute} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import CurrencySelector from '@components/CurrencySelector';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import RenderHTML from '@components/RenderHTML';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import StateSelector from '@components/StateSelector';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isValidAddress, isValidDebitCard, isValidExpirationDate, isValidLegalName, isValidPaymentZipCode, isValidSecurityCode} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddPaymentCardForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type PaymentCardFormProps = {
    shouldShowPaymentCardForm?: boolean;
    showAcceptTerms?: boolean;
    showAddressField?: boolean;
    showCurrencyField?: boolean;
    showStateSelector?: boolean;
    isDebitCard?: boolean;
    addPaymentCard: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM>, currency?: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>) => void;
    submitButtonText: string;
    /** Custom content to display in the footer after card form */
    footerContent?: ReactNode;
    /** Custom content to display in the header before card form */
    headerContent?: ReactNode;
    /** object to get currency route details from */
    currencySelectorRoute?: typeof ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY;
};

function IAcceptTheLabel() {
    const {translate} = useLocalize();

    return <RenderHTML html={translate('common.acceptTermsAndPrivacy')} />;
}

const REQUIRED_FIELDS = [
    INPUT_IDS.NAME_ON_CARD,
    INPUT_IDS.CARD_NUMBER,
    INPUT_IDS.EXPIRATION_DATE,
    INPUT_IDS.ADDRESS_STREET,
    INPUT_IDS.SECURITY_CODE,
    INPUT_IDS.ADDRESS_ZIP_CODE,
    INPUT_IDS.ADDRESS_STATE,
    INPUT_IDS.CURRENCY,
];

const CARD_TYPES = {
    DEBIT_CARD: 'debit',
    PAYMENT_CARD: 'payment',
};

const CARD_TYPE_SECTIONS = {
    DEFAULTS: 'defaults',
    ERROR: 'error',
};
type CartTypesMap = (typeof CARD_TYPES)[keyof typeof CARD_TYPES];
type CartTypeSectionsMap = (typeof CARD_TYPE_SECTIONS)[keyof typeof CARD_TYPE_SECTIONS];

type CardLabels = Record<CartTypesMap, Record<CartTypeSectionsMap, Record<string, TranslationPaths>>>;

const CARD_LABELS: CardLabels = {
    [CARD_TYPES.DEBIT_CARD]: {
        [CARD_TYPE_SECTIONS.DEFAULTS]: {
            cardNumber: 'addDebitCardPage.debitCardNumber',
            nameOnCard: 'addDebitCardPage.nameOnCard',
            expirationDate: 'addDebitCardPage.expirationDate',
            expiration: 'addDebitCardPage.expiration',
            securityCode: 'addDebitCardPage.cvv',
            billingAddress: 'addDebitCardPage.billingAddress',
        },
        [CARD_TYPE_SECTIONS.ERROR]: {
            nameOnCard: 'addDebitCardPage.error.invalidName',
            cardNumber: 'addDebitCardPage.error.debitCardNumber',
            expirationDate: 'addDebitCardPage.error.expirationDate',
            securityCode: 'addDebitCardPage.error.securityCode',
            addressStreet: 'addDebitCardPage.error.addressStreet',
            addressZipCode: 'addDebitCardPage.error.addressZipCode',
        },
    },
    [CARD_TYPES.PAYMENT_CARD]: {
        defaults: {
            cardNumber: 'addPaymentCardPage.paymentCardNumber',
            nameOnCard: 'addPaymentCardPage.nameOnCard',
            expirationDate: 'addPaymentCardPage.expirationDate',
            expiration: 'addPaymentCardPage.expiration',
            securityCode: 'addPaymentCardPage.cvv',
            billingAddress: 'addPaymentCardPage.billingAddress',
        },
        error: {
            nameOnCard: 'addPaymentCardPage.error.invalidName',
            cardNumber: 'addPaymentCardPage.error.paymentCardNumber',
            expirationDate: 'addPaymentCardPage.error.expirationDate',
            securityCode: 'addPaymentCardPage.error.securityCode',
            addressStreet: 'addPaymentCardPage.error.addressStreet',
            addressZipCode: 'addPaymentCardPage.error.addressZipCode',
        },
    },
};

function PaymentCardForm({
    shouldShowPaymentCardForm,
    addPaymentCard,
    showAcceptTerms,
    showAddressField,
    showCurrencyField,
    isDebitCard,
    submitButtonText,
    showStateSelector,
    footerContent,
    headerContent,
    currencySelectorRoute,
}: PaymentCardFormProps) {
    const styles = useThemeStyles();
    const [data, metadata] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM, {canBeMissing: true});

    const {translate} = useLocalize();
    const route = useRoute();
    const label = CARD_LABELS[isDebitCard ? CARD_TYPES.DEBIT_CARD : CARD_TYPES.PAYMENT_CARD];

    const cardNumberRef = useRef<AnimatedTextInputRef>(null);
    const [expirationDate, setExpirationDate] = useState(data?.expirationDate);

    const previousValueRef = useRef<string>('');

    // Formats user input into a valid expiration date (MM/YY) and automatically adds slash after the month.
    // Ensures the month is always between 01 and 12 by correcting invalid value to match the proper format.
    const onChangeExpirationDate = useCallback((newValue: string) => {
        if (typeof newValue !== 'string') {
            return;
        }

        let value = newValue.replaceAll(CONST.REGEX.NON_NUMERIC, '');

        if (value.length === 1) {
            const firstDigit = value.charAt(0);
            if (parseInt(firstDigit, 10) > 1) {
                value = `0${firstDigit}`;
            }
        }

        if (value.length >= 2) {
            const month = parseInt(value.slice(0, 2), 10);
            if (value.startsWith('00')) {
                value = '0';
            }
            if (month > 12) {
                value = `0${value.charAt(0)}${value.charAt(1)}${value.charAt(2)}`;
            }
        }

        const prevValue = previousValueRef.current?.replaceAll(CONST.REGEX.NON_NUMERIC, '') ?? '';
        let formattedValue = value;

        if (value.length === 2 && prevValue.length < 2) {
            formattedValue = `${value}/`;
        } else if (value.length > 2) {
            formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
        }

        previousValueRef.current = formattedValue;
        setExpirationDate(formattedValue);
    }, []);

    const [cardNumber, setCardNumber] = useState('');

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM> => {
        const errors = getFieldRequiredErrors(values, REQUIRED_FIELDS);

        if (values.nameOnCard && !isValidLegalName(values.nameOnCard)) {
            errors.nameOnCard = translate(label.error.nameOnCard);
        }

        if (values.cardNumber && !isValidDebitCard(values.cardNumber.replaceAll(' ', ''))) {
            errors.cardNumber = translate(label.error.cardNumber);
        }

        // When user pastes 5 digit value without slash, trim it to the first 4 digits before validation.
        const normalizedExpirationDate = values.expirationDate?.length === 5 && !values.expirationDate.includes('/') ? values.expirationDate.slice(0, 4) : values.expirationDate;

        if (normalizedExpirationDate && !isValidExpirationDate(normalizedExpirationDate)) {
            errors.expirationDate = translate(label.error.expirationDate);
        }

        if (values.securityCode && !isValidSecurityCode(values.securityCode)) {
            errors.securityCode = translate(label.error.securityCode);
        }

        if (values.addressStreet && !isValidAddress(values.addressStreet)) {
            errors.addressStreet = translate(label.error.addressStreet);
        }

        // If tempered with, this can block users from adding payment cards so
        // do not touch unless you are aware of the context.
        // See issue: https://github.com/Expensify/App/issues/55493#issuecomment-2616349754
        if (values.addressZipCode && !isValidPaymentZipCode(values.addressZipCode)) {
            errors.addressZipCode = translate('addPaymentCardPage.error.addressZipCode');
        } else if (values.addressZipCode.length > CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE) {
            errors.addressZipCode = translate('common.error.characterLimitExceedCounter', values.addressZipCode.length, CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE);
        }

        if (!values.acceptTerms) {
            errors.acceptTerms = translate('common.error.acceptTerms');
        }

        return errors;
    };

    const onChangeCardNumber = useCallback((newValue: string) => {
        // Replace all characters that are not spaces or digits
        let validCardNumber = newValue.replaceAll(/[^\d ]/g, '');

        // Gets only the first 16 digits if the inputted number have more digits than that
        validCardNumber = validCardNumber.match(/(?:\d *){1,16}/)?.[0] ?? '';

        // Remove all spaces to simplify formatting
        const cleanedNumber = validCardNumber.replaceAll(' ', '');

        // Check if the number is a potential Amex card (starts with 34 or 37 and has up to 15 digits)
        const isAmex = /^3[47]\d{0,13}$/.test(cleanedNumber);

        // Format based on Amex or standard 4-4-4-4 pattern
        if (isAmex) {
            // Format as 4-6-5 for Amex
            validCardNumber = cleanedNumber.replaceAll(/(\d{1,4})(\d{1,6})?(\d{1,5})?/g, (match, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join(' '));
        } else {
            // Format as 4-4-4-4 for non-Amex
            validCardNumber = cleanedNumber.match(/.{1,4}/g)?.join(' ') ?? '';
        }

        setCardNumber(validCardNumber);
    }, []);

    if (!shouldShowPaymentCardForm || isLoadingOnyxValue(metadata)) {
        return null;
    }

    return (
        <>
            {headerContent}
            <FormProvider
                formID={ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM}
                validate={validate}
                onSubmit={addPaymentCard}
                submitButtonText={submitButtonText}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CARD_NUMBER}
                    defaultValue={data?.cardNumber}
                    label={translate(label.defaults.cardNumber)}
                    aria-label={translate(label.defaults.cardNumber)}
                    role={CONST.ROLE.PRESENTATION}
                    ref={cardNumberRef}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    onChangeText={onChangeCardNumber}
                    value={cardNumber}
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.NAME_ON_CARD}
                    defaultValue={data?.nameOnCard}
                    label={translate(label.defaults.nameOnCard)}
                    aria-label={translate(label.defaults.nameOnCard)}
                    role={CONST.ROLE.PRESENTATION}
                    containerStyles={[styles.mt5]}
                    spellCheck={false}
                    forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                />
                <View style={[styles.flexRow, styles.mt5]}>
                    <View style={[styles.mr2, styles.flex1]}>
                        <InputWrapper
                            defaultValue={data?.expirationDate}
                            value={expirationDate}
                            onChangeText={onChangeExpirationDate}
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.EXPIRATION_DATE}
                            label={translate(label.defaults.expiration)}
                            testID={label.defaults.expiration}
                            aria-label={translate(label.defaults.expiration)}
                            role={CONST.ROLE.PRESENTATION}
                            placeholder={translate(label.defaults.expirationDate)}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                            maxLength={5}
                            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                        />
                    </View>
                    <View style={styles.flex1}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.SECURITY_CODE}
                            defaultValue={data?.securityCode}
                            label={translate(label.defaults.securityCode)}
                            aria-label={translate(label.defaults.securityCode)}
                            role={CONST.ROLE.PRESENTATION}
                            maxLength={4}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                        />
                    </View>
                </View>
                {!!showAddressField && (
                    <View>
                        <InputWrapper
                            defaultValue={data?.addressStreet}
                            InputComponent={AddressSearch}
                            inputID={INPUT_IDS.ADDRESS_STREET}
                            label={translate(label.defaults.billingAddress)}
                            containerStyles={[styles.mt5]}
                            maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                            // Limit the address search only to the USA until we fully can support international debit cards
                            limitSearchesToCountry={CONST.COUNTRY.US}
                            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                        />
                    </View>
                )}
                <InputWrapper
                    InputComponent={TextInput}
                    defaultValue={data?.addressZipCode}
                    inputID={INPUT_IDS.ADDRESS_ZIP_CODE}
                    label={translate('common.zipPostCode')}
                    aria-label={translate('common.zipPostCode')}
                    role={CONST.ROLE.PRESENTATION}
                    containerStyles={[styles.mt5]}
                />
                {!!showStateSelector && (
                    <View style={[styles.mt4, styles.mhn5]}>
                        <InputWrapper
                            stateSelectorRoute={route.name === SCREENS.IOU_SEND.ADD_DEBIT_CARD ? ROUTES.MONEY_REQUEST_STATE_SELECTOR : undefined}
                            InputComponent={StateSelector}
                            inputID={INPUT_IDS.ADDRESS_STATE}
                        />
                    </View>
                )}
                {!!showCurrencyField && (
                    <View style={[styles.mt4, styles.mhn5]}>
                        <InputWrapper
                            currencySelectorRoute={currencySelectorRoute}
                            value={data?.currency ?? CONST.PAYMENT_CARD_CURRENCY.USD}
                            InputComponent={CurrencySelector}
                            inputID={INPUT_IDS.CURRENCY}
                        />
                    </View>
                )}
                {!!showAcceptTerms && (
                    <View style={[styles.mt4, styles.ml1]}>
                        <InputWrapper
                            InputComponent={CheckboxWithLabel}
                            accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.addCardTermsOfService')} ${translate('common.and')} ${translate(
                                'common.privacyPolicy',
                            )}`}
                            inputID={INPUT_IDS.ACCEPT_TERMS}
                            defaultValue={!!data?.acceptTerms}
                            LabelComponent={IAcceptTheLabel}
                        />
                    </View>
                )}
                {footerContent}
            </FormProvider>
        </>
    );
}

export default PaymentCardForm;
