import {parsePhoneNumber} from '@libs/PhoneNumber';

describe('PhoneNumber', () => {
    describe('parsePhoneNumber', () => {
        it('Should return valid phone number', () => {
            const validNumbers = [
                '+1 (234) 567-8901',
                '+12345678901',
                '+54 11 8765-4321',
                '+49 30 123456',
                '+44 20 8759 9036',
                '+34 606 49 95 99',
                ' + 1 2 3 4 5 6 7 8 9 0 1',
                '+ 4 4 2 0 8 7 5 9 9 0 3 6',
                '+1 ( 2 3 4 ) 5 6 7 - 8 9 0 1',
            ];

            for (const givenPhone of validNumbers) {
                const parsedPhone = parsePhoneNumber(givenPhone);
                expect(parsedPhone.valid).toBe(true);
                expect(parsedPhone.possible).toBe(true);
            }
        });
        it('Should return invalid phone number if US number has extra 1 after country code', () => {
            const validNumbers = ['+1 1 (234) 567-8901', '+112345678901', '+115550123355', '+ 1 1 5 5 5 0 1 2 3 3 5 5'];

            for (const givenPhone of validNumbers) {
                const parsedPhone = parsePhoneNumber(givenPhone);
                expect(parsedPhone.valid).toBe(false);
                expect(parsedPhone.possible).toBe(false);
            }
        });
        it('Should return invalid phone number', () => {
            const invalidNumbers = ['+165025300001', 'John Doe', '123', '0945789083', 'email@domain.com'];

            for (const givenPhone of invalidNumbers) {
                const parsedPhone = parsePhoneNumber(givenPhone);
                expect(parsedPhone.valid).toBe(false);
                expect(parsedPhone.possible).toBe(false);
            }
        });
    });
});
