import formatWithDisplayFormat from '@components/DynamicForm/utils/formatWithDisplayFormat';

const SORT_CODE = {key: 'sortCode', displayFormat: '**-**-**', regex: String.raw`^\d{2}-?\d{2}-?\d{2}$`, maxLength: 8};
const IBAN = {key: 'IBAN', displayFormat: '**** **** **** **** **** **** **** ****', regex: '^[a-zA-Z]{2}[a-zA-Z0-9 ]{12,40}$', maxLength: 42};

describe('formatWithDisplayFormat', () => {
    it('lays a sort code out with its dashes', () => {
        // Given a sort code typed without dashes
        // When it is formatted
        // Then it reads the way a bank prints it
        expect(formatWithDisplayFormat('231470', SORT_CODE)).toBe('23-14-70');
    });

    it('keeps an answer that already has the layout', () => {
        // Given a sort code typed with its dashes
        // When it is formatted
        // Then nothing changes
        expect(formatWithDisplayFormat('23-14-70', SORT_CODE)).toBe('23-14-70');
    });

    it('groups an answer shorter than the format', () => {
        // Given a German IBAN, which is shorter than the longest IBAN the format allows
        // When it is formatted
        // Then it is grouped in fours and ends where the answer ends
        expect(formatWithDisplayFormat('DE89370400440532013000', IBAN)).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('keeps an answer the field would reject once laid out', () => {
        // Given a sort code that is not finished, and one with too many digits
        // When they are formatted
        // Then they stay as typed, so the format error names what the user entered
        expect(formatWithDisplayFormat('2314', SORT_CODE)).toBe('2314');
        expect(formatWithDisplayFormat('2314701', SORT_CODE)).toBe('2314701');
    });

    it('keeps an answer whose layout is longer than the field takes', () => {
        // Given an account number whose fully separated form passes the field's length limit
        // When it is formatted
        // Then it stays as typed
        expect(formatWithDisplayFormat('123456781234567812345678', {key: 'accountNumber', displayFormat: '********-********-********', maxLength: 24})).toBe('123456781234567812345678');
    });

    it('keeps the answer of a field without a format', () => {
        // Given a field with no display format
        // When its answer is formatted
        // Then it stays as typed
        expect(formatWithDisplayFormat('28821822', {key: 'accountNumber'})).toBe('28821822');
    });
});
