import isSensitiveInput from '@libs/Fullstory/isSensitiveInput';

describe('isSensitiveInput', () => {
    it.each(['cc-number', 'cc-csc', 'cc-exp', 'cc-name', 'birthdate-full', 'street-address', 'address-line1', 'postal-code', 'tel', 'tel-national', 'one-time-code', 'sms-otp'] as const)(
        'should treat autoComplete "%s" as sensitive',
        (autoComplete) => {
            // Given an input whose autofill hint says it holds card, birth date, address, phone or code data
            // When FullStory decides whether it has to be masked
            const result = isSensitiveInput({autoComplete});

            // Then it is sensitive, so it gets masked even without a class passed to it
            expect(result).toBe(true);
        },
    );

    it.each(['creditCardNumber', 'oneTimeCode', 'postalCode', 'fullStreetAddress', 'telephoneNumber', 'birthdate'] as const)(
        'should treat textContentType "%s" as sensitive',
        (textContentType) => {
            // Given an iOS input whose content type says it holds sensitive data
            // When FullStory decides whether it has to be masked
            const result = isSensitiveInput({textContentType});

            // Then it is sensitive too, since iOS autofill reads textContentType instead of autoComplete
            expect(result).toBe(true);
        },
    );

    it.each([{autoComplete: 'given-name'}, {autoComplete: 'family-name'}, {autoComplete: 'email'}, {autoComplete: 'off'}, {textContentType: 'username'}, {}] as const)(
        'should not treat %j as sensitive',
        (hints) => {
            // Given an input with no hint, or a hint for data the masking rules leave visible, like names and emails
            // When FullStory decides whether it has to be masked
            const result = isSensitiveInput(hints);

            // Then it isn't sensitive, so it follows its container instead
            expect(result).toBe(false);
        },
    );
});
