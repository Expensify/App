import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';

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

    describe('parsePhoneNumber results', () => {
        const US_NUMBER = {
            number: {
                input: '+12015550123',
                international: '+1 201-555-0123',
                national: '(201) 555-0123',
                e164: '+12015550123',
                rfc3966: 'tel:+1-201-555-0123',
                significant: '2015550123',
            },
            regionCode: 'US',
            valid: true,
            possible: true,
            canBeInternationallyDialled: true,
            possibility: 'is-possible',
            type: 'fixed-line-or-mobile',
            typeIsMobile: true,
            typeIsFixedLine: true,
            countryCode: 1,
        };

        it('returns the full result for a number in E.164 form', () => {
            expect(parsePhoneNumber('+12015550123')).toEqual(US_NUMBER);
        });

        it('keeps the original input for a number with spaces', () => {
            expect(parsePhoneNumber('+1 201 555 0123')).toEqual({...US_NUMBER, number: {...US_NUMBER.number, input: '+1 201 555 0123'}});
        });

        it('returns the national and international forms of a number from another region', () => {
            expect(parsePhoneNumber('+44 20 8759 9036')).toEqual({
                number: {
                    input: '+44 20 8759 9036',
                    international: '+44 20 8759 9036',
                    national: '020 8759 9036',
                    e164: '+442087599036',
                    rfc3966: 'tel:+44-20-8759-9036',
                    significant: '2087599036',
                },
                regionCode: 'GB',
                valid: true,
                possible: true,
                canBeInternationallyDialled: true,
                possibility: 'is-possible',
                type: 'fixed-line',
                typeIsMobile: false,
                typeIsFixedLine: true,
                countryCode: 44,
            });
        });

        it('marks a US number with an extra 1 after the country code as invalid', () => {
            expect(parsePhoneNumber('+112345678901')).toEqual({
                number: {
                    input: '+112345678901',
                    international: '+1 12345678901',
                    national: '12345678901',
                    e164: '+112345678901',
                    rfc3966: 'tel:+1-12345678901',
                    significant: '12345678901',
                },
                regionCode: 'US',
                valid: false,
                possible: false,
                canBeInternationallyDialled: true,
                possibility: 'is-possible',
                type: 'fixed-line-or-mobile',
                typeIsMobile: true,
                typeIsFixedLine: true,
                countryCode: 1,
            });
        });

        it('returns an invalid result for national numbers, names, empty strings and SMS logins', () => {
            expect(parsePhoneNumber('(201) 555-0123')).toEqual({number: {input: '(201) 555-0123'}, regionCode: null, valid: false, possible: false, possibility: 'invalid-country-code'});
            expect(parsePhoneNumber('2015550123')).toEqual({number: {input: '2015550123'}, regionCode: null, valid: false, possible: false, possibility: 'invalid-country-code'});
            expect(parsePhoneNumber('John Doe')).toEqual({number: {input: 'John Doe'}, regionCode: null, valid: false, possible: false, possibility: 'invalid-country-code'});
            expect(parsePhoneNumber('')).toEqual({number: {input: ''}, regionCode: null, valid: false, possible: false, possibility: 'invalid-country-code'});
            expect(parsePhoneNumber('+1')).toEqual({number: {input: '+1'}, regionCode: 'US', valid: false, possible: false, possibility: 'unknown'});
            expect(parsePhoneNumber('+12015550123@expensify.sms')).toEqual({
                number: {input: '+12015550123@expensify.sms'},
                regionCode: 'US',
                valid: false,
                possible: false,
                possibility: 'unknown',
            });
        });

        it('uses the region code option for a national number, without changing the result of a call without it', () => {
            const resultWithoutRegion = parsePhoneNumber('2015550123');

            expect(parsePhoneNumber('2015550123', {regionCode: 'US'})).toEqual({...US_NUMBER, number: {...US_NUMBER.number, input: '2015550123'}});
            expect(parsePhoneNumber('2015550123')).toEqual(resultWithoutRegion);
            expect(resultWithoutRegion.valid).toBe(false);
        });

        it('returns the same result every time the same number is parsed', () => {
            const inputs = ['+12015550123', '+1 201 555 0123', '+44 20 8759 9036', '+112345678901', '(201) 555-0123', '+1', '', 'John Doe'];
            const firstResults = inputs.map((input) => parsePhoneNumber(input));
            const secondResults = inputs.map((input) => parsePhoneNumber(input));

            expect(secondResults).toEqual(firstResults);
        });

        it('does not let a caller change the result that later callers get', () => {
            // Given a parsed number that a caller then tries to change
            const firstResult = parsePhoneNumber('+12015550123');
            Reflect.set(firstResult, 'valid', false);
            if (firstResult.number) {
                Reflect.set(firstResult.number, 'e164', '+10000000000');
            }

            // When the same number is parsed again
            const secondResult = parsePhoneNumber('+12015550123');

            // Then the result is unchanged
            expect(secondResult).toEqual(US_NUMBER);
        });
    });

    describe('addSMSDomainIfPhoneNumber', () => {
        it('returns logins that are already on the SMS domain unchanged', () => {
            for (const login of [
                '+12015550123@expensify.sms',
                '+12015550123@EXPENSIFY.SMS',
                '12015550123@expensify.sms',
                ' +12015550123@expensify.sms',
                '+12015550123@expensify.sms ',
                '@expensify.sms',
            ]) {
                expect(addSMSDomainIfPhoneNumber(login)).toBe(login);
            }
        });

        it('adds the SMS domain to an international number in any format', () => {
            expect(addSMSDomainIfPhoneNumber('+12015550123')).toBe('+12015550123@expensify.sms');
            expect(addSMSDomainIfPhoneNumber('+1 (201) 555-0123')).toBe('+12015550123@expensify.sms');
            expect(addSMSDomainIfPhoneNumber('+44 20 8759 9036')).toBe('+442087599036@expensify.sms');
        });

        it('returns emails, names, national numbers and invalid numbers unchanged', () => {
            for (const login of ['user@example.com', 'USER@Example.com', '2015550123', '(201) 555-0123', '+112345678901', '+11005550009', 'John Doe', '+', '']) {
                expect(addSMSDomainIfPhoneNumber(login)).toBe(login);
            }
        });

        it('returns an empty string when no login is given', () => {
            expect(addSMSDomainIfPhoneNumber()).toBe('');
        });

        it('returns an email containing a literal % without throwing', () => {
            // Given a contact method route param the router already decoded, for an email whose `%al` is not a valid escape sequence
            const contactMethodParam = 'test%alias@gmail.com';

            // When the contact method pages read it
            const contactMethod = addSMSDomainIfPhoneNumber(contactMethodParam);

            // Then the email is kept as-is, because decoding it a second time would throw a URIError and crash the page
            expect(contactMethod).toBe('test%alias@gmail.com');
        });

        it('does not decode valid escape sequences', () => {
            // Given an already-decoded email that happens to contain a valid escape sequence
            const contactMethodParam = 'a%41b@x.com';

            // When the contact method pages read it
            const contactMethod = addSMSDomainIfPhoneNumber(contactMethodParam);

            // Then the email is kept as-is, because turning `%41` into `A` would make the login lookup miss
            expect(contactMethod).toBe('a%41b@x.com');
        });

        it('returns a regular email unchanged', () => {
            // Given a regular email
            const contactMethodParam = 'test@gmail.com';

            // When the contact method pages read it
            const contactMethod = addSMSDomainIfPhoneNumber(contactMethodParam);

            // Then the email matches the login key stored in the login list
            expect(contactMethod).toBe('test@gmail.com');
        });

        it('adds the SMS domain to a phone number', () => {
            // Given a phone number, which is stored in the login list with the SMS domain
            const contactMethodParam = '+15005550006';

            // When the contact method pages read it
            const contactMethod = addSMSDomainIfPhoneNumber(contactMethodParam);

            // Then the SMS domain is added so the login lookup finds the phone number
            expect(contactMethod).toBe('+15005550006@expensify.sms');
        });
    });
});
