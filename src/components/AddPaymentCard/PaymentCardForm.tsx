import {useRoute} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Hoverable from '@components/Hoverable';
import * as Expensicons from '@components/Icon/Expensicons';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddDebitCardForm';
import PaymentCardCurrencyModal from './PaymentCardCurrencyModal';

type PaymentCardFormProps = {
    shouldShowPaymentCardForm?: boolean;
    showAcceptTerms?: boolean;
    showAddressField?: boolean;
    showCurrencyField?: boolean;
    showStateSelector?: boolean;
    isDebitCard?: boolean;
    addPaymentCard: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>, currency?: ValueOf<typeof CONST.CURRENCY>) => void;
    submitButtonText: string;
    /** Custom content to display in the footer after card form */
    footerContent?: ReactNode;
    /** Custom content to display in the header before card form */
    headerContent?: ReactNode;
};

function IAcceptTheLabel() {
    const {translate} = useLocalize();

    return (
        <Text>
            {`${translate('common.iAcceptThe')}`}
            <TextLink href={CONST.TERMS_URL}>{`${translate('common.addCardTermsOfService')}`}</TextLink> {`${translate('common.and')}`}
            <TextLink href={CONST.PRIVACY_URL}> {` ${translate('common.privacyPolicy')} `}</TextLink>
        </Text>
    );
}

const REQUIRED_FIELDS = [
    INPUT_IDS.NAME_ON_CARD,
    INPUT_IDS.CARD_NUMBER,
    INPUT_IDS.EXPIRATION_DATE,
    INPUT_IDS.ADDRESS_STREET,
    INPUT_IDS.SECURITY_CODE,
    INPUT_IDS.ADDRESS_ZIP_CODE,
    INPUT_IDS.ADDRESS_STATE,
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
}: PaymentCardFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute();
    const label = CARD_LABELS[isDebitCard ? CARD_TYPES.DEBIT_CARD : CARD_TYPES.PAYMENT_CARD];

    const cardNumberRef = useRef<AnimatedTextInputRef>(null);

    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [currency, setCurrency] = useState<keyof typeof CONST.CURRENCY>(CONST.CURRENCY.USD);

    const validate = (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(formValues, REQUIRED_FIELDS);

        if (formValues.nameOnCard && !ValidationUtils.isValidLegalName(formValues.nameOnCard)) {
            errors.nameOnCard = label.error.nameOnCard;
        }

        if (formValues.cardNumber && !ValidationUtils.isValidDebitCard(formValues.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = label.error.cardNumber;
        }

        if (formValues.expirationDate && !ValidationUtils.isValidExpirationDate(formValues.expirationDate)) {
            errors.expirationDate = label.error.expirationDate;
        }

        if (formValues.securityCode && !ValidationUtils.isValidSecurityCode(formValues.securityCode)) {
            errors.securityCode = label.error.securityCode;
        }

        if (formValues.addressStreet && !ValidationUtils.isValidAddress(formValues.addressStreet)) {
            errors.addressStreet = label.error.addressStreet;
        }

        if (formValues.addressZipCode && !ValidationUtils.isValidZipCode(formValues.addressZipCode)) {
            errors.addressZipCode = label.error.addressZipCode;
        }

        if (!formValues.acceptTerms) {
            errors.acceptTerms = 'common.error.acceptTerms';
        }

        return errors;
    };

    const showCurrenciesModal = useCallback(() => {
        setIsCurrencyModalVisible(true);
    }, []);

    const changeCurrency = useCallback((newCurrency: keyof typeof CONST.CURRENCY) => {
        setCurrency(newCurrency);
        setIsCurrencyModalVisible(false);
    }, []);

    if (!shouldShowPaymentCardForm) {
        return null;
    }

    return (
        <>
            {headerContent}
            <FormProvider
                formID={ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM}
                validate={validate}
                onSubmit={(formData) => addPaymentCard(formData, currency)}
                submitButtonText={submitButtonText}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CARD_NUMBER}
                    label={translate(label.defaults.cardNumber)}
                    aria-label={translate(label.defaults.cardNumber)}
                    role={CONST.ROLE.PRESENTATION}
                    ref={cardNumberRef}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.NAME_ON_CARD}
                    label={translate(label.defaults.nameOnCard)}
                    aria-label={translate(label.defaults.nameOnCard)}
                    role={CONST.ROLE.PRESENTATION}
                    containerStyles={[styles.mt5]}
                    spellCheck={false}
                />
                <View style={[styles.flexRow, styles.mt5]}>
                    <View style={[styles.mr2, styles.flex1]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.EXPIRATION_DATE}
                            label={translate(label.defaults.expiration)}
                            aria-label={translate(label.defaults.expiration)}
                            role={CONST.ROLE.PRESENTATION}
                            placeholder={translate(label.defaults.expirationDate)}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                            maxLength={4}
                        />
                    </View>
                    <View style={styles.flex1}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.SECURITY_CODE}
                            label={translate(label.defaults.securityCode)}
                            aria-label={translate(label.defaults.securityCode)}
                            role={CONST.ROLE.PRESENTATION}
                            maxLength={4}
                            inputMode={CONST.INPUT_MODE.NUMERIC}
                        />
                    </View>
                </View>
                {!!showAddressField && (
                    <View>
                        <InputWrapper
                            InputComponent={AddressSearch}
                            inputID={INPUT_IDS.ADDRESS_STREET}
                            label={translate(label.defaults.billingAddress)}
                            containerStyles={[styles.mt5]}
                            maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                            // Limit the address search only to the USA until we fully can support international debit cards
                            isLimitedToUSA
                        />
                    </View>
                )}
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.ADDRESS_ZIP_CODE}
                    label={translate('common.zip')}
                    aria-label={translate('common.zip')}
                    role={CONST.ROLE.PRESENTATION}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
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
                    <Hoverable>
                        {(isHovered) => (
                            <TextInput
                                label={translate('common.currency')}
                                aria-label={translate('common.currency')}
                                role={CONST.ROLE.COMBOBOX}
                                icon={Expensicons.ArrowRight}
                                onPress={showCurrenciesModal}
                                value={currency}
                                containerStyles={[styles.mt5]}
                                inputStyle={isHovered && styles.cursorPointer}
                                hideFocusedState
                                caretHidden
                            />
                        )}
                    </Hoverable>
                )}
                {!!showAcceptTerms && (
                    <View style={[styles.mt4, styles.ml1]}>
                        <InputWrapper
                            InputComponent={CheckboxWithLabel}
                            accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.addCardTermsOfService')} ${translate('common.and')} ${translate(
                                'common.privacyPolicy',
                            )}`}
                            inputID={INPUT_IDS.ACCEPT_TERMS}
                            defaultValue={false}
                            LabelComponent={IAcceptTheLabel}
                        />
                    </View>
                )}

                <PaymentCardCurrencyModal
                    isVisible={isCurrencyModalVisible}
                    currencies={Object.keys(CONST.CURRENCY) as Array<keyof typeof CONST.CURRENCY>}
                    currentCurrency={currency}
                    onCurrencyChange={changeCurrency}
                    onClose={() => setIsCurrencyModalVisible(false)}
                />
                {footerContent}
            </FormProvider>
        </>
    );
}

PaymentCardForm.displayName = 'PaymentCardForm';

export default PaymentCardForm;
