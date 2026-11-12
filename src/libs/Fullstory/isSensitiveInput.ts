import type {TextInputProps} from 'react-native';

type SensitiveInputHints = Pick<TextInputProps, 'autoComplete' | 'textContentType'>;

const SENSITIVE_AUTO_COMPLETE_VALUES = new Set<TextInputProps['autoComplete']>([
    'cc-csc',
    'cc-exp',
    'cc-exp-day',
    'cc-exp-month',
    'cc-exp-year',
    'cc-number',
    'cc-name',
    'cc-given-name',
    'cc-middle-name',
    'cc-family-name',
    'cc-type',
    'birthdate-day',
    'birthdate-full',
    'birthdate-month',
    'birthdate-year',
    'address-line1',
    'address-line2',
    'street-address',
    'postal-address',
    'postal-address-country',
    'postal-address-dependent-locality',
    'postal-address-extended',
    'postal-address-extended-postal-code',
    'postal-address-locality',
    'postal-address-region',
    'postal-address-unit',
    'postal-code',
    'tel',
    'tel-country-code',
    'tel-national',
    'tel-device',
    'one-time-code',
    'sms-otp',
    'email-otp',
    '2fa-app-otp',
]);

const SENSITIVE_TEXT_CONTENT_TYPES = new Set<TextInputProps['textContentType']>([
    'creditCardNumber',
    'creditCardSecurityCode',
    'creditCardExpiration',
    'creditCardExpirationMonth',
    'creditCardExpirationYear',
    'creditCardName',
    'creditCardGivenName',
    'creditCardMiddleName',
    'creditCardFamilyName',
    'creditCardType',
    'oneTimeCode',
    'birthdate',
    'birthdateDay',
    'birthdateMonth',
    'birthdateYear',
    'fullStreetAddress',
    'streetAddressLine1',
    'streetAddressLine2',
    'postalCode',
    'telephoneNumber',
]);

/**
 * Whether an input's autofill hints say it holds card, code, birth date, address or phone data, which FullStory has to
 * mask even when nobody passed a class for it.
 */
function isSensitiveInput({autoComplete, textContentType}: SensitiveInputHints): boolean {
    return SENSITIVE_AUTO_COMPLETE_VALUES.has(autoComplete) || SENSITIVE_TEXT_CONTENT_TYPES.has(textContentType);
}

export default isSensitiveInput;
export type {SensitiveInputHints};
