import {parsePhoneNumber} from '@libs/PhoneNumber';

describe('PhoneNumber', () => {
    describe('parsePhoneNumber', () => {
        it('Should return valid phone number', () => {
            const givenPhone = '+1 (234) 567-8901';
            const parsedPhone = parsePhoneNumber(givenPhone);
            expect(parsedPhone.valid).toBe(true);
            expect(parsedPhone.possible).toBe(true);
        });
        it('Should return invalid phone number if US number has extra 1 after country code', () => {
            const givenPhone = '+1 1 (234) 567-8901';
            const parsedPhone = parsePhoneNumber(givenPhone);
            expect(parsedPhone.valid).toBe(false);
            expect(parsedPhone.possible).toBe(false);
        });
    });
});
