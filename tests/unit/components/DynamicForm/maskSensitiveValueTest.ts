import maskSensitiveValue from '@components/DynamicForm/utils/maskSensitiveValue';

describe('maskSensitiveValue', () => {
    it('shows an SSN as •••-••-1234', () => {
        // Given a full nine digit SSN
        // When it is masked
        // Then only the last four digits stay, in the usual SSN grouping, so the user can tell which number they entered
        expect(maskSensitiveValue('123451234')).toBe('•••-••-1234');
    });

    it('keeps the last four characters of any other value', () => {
        // Given an account number that is not an SSN
        // When it is masked
        // Then everything but the last four characters is hidden
        expect(maskSensitiveValue('00112233445')).toBe('•••••••3445');
    });

    it('hides half of a short value', () => {
        // Given values of four characters or fewer, such as a PIN
        // When they are masked
        // Then at most half of each stays visible, so a short answer is never shown in full
        expect(maskSensitiveValue('1234')).toBe('••34');
        expect(maskSensitiveValue('12')).toBe('•2');
        expect(maskSensitiveValue('1')).toBe('•');
    });
});
