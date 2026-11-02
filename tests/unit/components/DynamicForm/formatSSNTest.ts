import formatSSN from '@components/DynamicForm/utils/formatSSN';

describe('formatSSN', () => {
    it.each([
        ['123451234', '123-45-1234'],
        ['000012345', '000-01-2345'],
        ['000000000', '000-00-0000'],
    ])('groups %s as %s', (value, expected) => {
        // Given nine digits, including ones starting with zeros that the SSN validator rejects but the form accepts
        // When they are formatted
        // Then they are grouped the way an SSN is usually written
        expect(formatSSN(value)).toBe(expected);
    });

    it.each(['12345', '1234512345', '12345678a'])('leaves %s as it is', (value) => {
        // Given a value that is not nine digits
        // When it is formatted
        // Then it is not grouped, since the grouping only fits nine digits
        expect(formatSSN(value)).toBe(value);
    });
});
