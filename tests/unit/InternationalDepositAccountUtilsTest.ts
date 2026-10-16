// cspell:words SBININBB SBININ asdfgh
import {getValidationErrors, testValidation} from '@pages/settings/Wallet/InternationalDepositAccount/utils';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {CorpayFieldsMap} from '@src/types/onyx/CorpayFields';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';

const providerError = 'Beneficiary Bank BIC is invalid. Must be 8 or 11 characters long';

function getFieldsMap(fieldName: string = INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE, regEx: string = CONST.CORPAY_FIELDS.STRICT_SWIFT_BIC_REGEX, isRequired = true): CorpayFieldsMap {
    return createMock<CorpayFieldsMap>({
        [fieldName]: {
            isRequired,
            validationRules: [{regEx, errorMessage: providerError}],
        },
    });
}

describe('International deposit account validation', () => {
    it.each(['12345678', '12345678901', 'SBININBB10'])('explains the strict SWIFT format for %s', (swiftBicCode) => {
        // Given a bank whose SWIFT rule requires a six-letter prefix and exactly 8 or 11 characters.
        const fieldsMap = getFieldsMap();

        // When the entered value fails that rule.
        const errors = getValidationErrors({swiftBicCode}, fieldsMap, translateLocal);

        // Then the localized message describes both length and character requirements.
        expect(errors).toEqual({
            swiftBicCode: translateLocal('addPersonalBankAccount.swiftBicFormatError'),
        });
    });

    it.each(['SBININBB', 'SBININBB101', 'asdfgh12'])('clears the format error after correcting the value to %s', (swiftBicCode) => {
        // Given a failed validation with the strict rule.
        const fieldsMap = getFieldsMap();
        expect(getValidationErrors({swiftBicCode: '12345678'}, fieldsMap, translateLocal)).toHaveProperty(INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE);

        // When the user corrects the value to match the provider rule.
        const errors = getValidationErrors({swiftBicCode}, fieldsMap, translateLocal);

        // Then no error remains to block continuation.
        expect(errors).toEqual({});
    });

    it.each([
        [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE, '^.{0,12}$', '1234567890123'],
        [INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE, '^.{8}$', '123'],
        ['routingCode', CONST.CORPAY_FIELDS.STRICT_SWIFT_BIC_REGEX, '12345678'],
    ])('preserves the provider message for %s with %s', (fieldName, pattern, value) => {
        // Given another format or a non-SWIFT field, whose requirements must not be inferred.
        const fieldsMap = getFieldsMap(fieldName, pattern);

        // When its rule fails.
        const errors = getValidationErrors({[fieldName]: value}, fieldsMap, translateLocal);

        // Then Corpay's own message is retained.
        expect(errors).toEqual({[fieldName]: providerError});
    });

    it('accepts numeric codes when the provider only restricts length', () => {
        // Given the permissive provider rule used in production.
        const fieldsMap = getFieldsMap(INPUT_IDS.ADDITIONAL_DATA.CORPAY.SWIFT_BIC_CODE, '^.{0,12}$');

        // When a numeric code satisfies that rule.
        const errors = getValidationErrors({swiftBicCode: '12345678'}, fieldsMap, translateLocal);

        // Then the stricter format is not imposed by the frontend.
        expect(errors).toEqual({});
    });

    it('keeps the required-field message for empty input', () => {
        // Given a required SWIFT field.
        const fieldsMap = getFieldsMap();

        // When no value has been provided.
        const errors = getValidationErrors({swiftBicCode: ''}, fieldsMap, translateLocal);

        // Then the required-field message takes precedence over format guidance.
        expect(errors).toEqual({
            swiftBicCode: translateLocal('common.error.fieldRequired'),
        });
    });

    it('preserves additional failed rules on the SWIFT field', () => {
        // Given an additional provider constraint independent of the strict format.
        const fieldsMap = getFieldsMap();
        fieldsMap.swiftBicCode.validationRules.push({
            regEx: '^[^<>]*$',
            errorMessage: 'Angle brackets are not allowed',
        });

        // When both rules fail.
        const errors = getValidationErrors({swiftBicCode: 'SBININ<>'}, fieldsMap, translateLocal);

        // Then the localized format guidance does not hide the other provider error.
        expect(errors).toEqual({
            swiftBicCode: `${translateLocal('addPersonalBankAccount.swiftBicFormatError')}\nAngle brackets are not allowed`,
        });
    });

    it.each(['', '   '])('skips the validation rules when an optional field is left blank (%p)', (routingCode) => {
        // Given an optional field whose rule doesn't match an empty value, like Poland's secondary routing code.
        const fieldsMap = getFieldsMap('routingCode', '^[0-9]{8}$', false);

        // When the user leaves it blank.
        const errors = getValidationErrors({routingCode}, fieldsMap, translateLocal);

        // Then it doesn't block the user, since there is nothing to validate.
        expect(errors).toEqual({});
        expect(testValidation({routingCode}, fieldsMap)).toBe(true);
    });

    it('still validates an optional field when a value is provided', () => {
        // Given an optional field with a format rule.
        const fieldsMap = getFieldsMap('routingCode', '^[0-9]{8}$', false);

        // When the user enters a value that doesn't match it.
        const errors = getValidationErrors({routingCode: 'ABC'}, fieldsMap, translateLocal);

        // Then the provider message is shown, so bad values don't reach Corpay.
        expect(errors).toEqual({routingCode: providerError});
        expect(testValidation({routingCode: 'ABC'}, fieldsMap)).toBe(false);
    });
});
