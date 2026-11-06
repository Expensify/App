import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';

// Compare the wrapper with its producer to keep the complete parser metadata in these expectations.
// eslint-disable-next-line no-restricted-imports
import {parsePhoneNumber as originalParsePhoneNumber} from 'awesome-phonenumber';

describe('PhoneNumber', () => {
    describe('parsePhoneNumber', () => {
        it('preserves the parser result when it is already impossible', () => {
            // Given a number the parser cannot treat as possible
            // When the wrapper receives that number
            // Then it returns the parser's complete result without rewritten fields
            const number = 'John Doe';
            expect(parsePhoneNumber(number)).toEqual(originalParsePhoneNumber(number));
        });

        it('rewrites every number field for a possible number rejected by the stricter format', () => {
            // Given a parser-possible number with punctuation excluded by the app format
            // When the wrapper rejects the app format
            // Then all five number fields use the stripped input while parser metadata remains
            const number = '+1 (234) 567-8901 ext 2';
            const parsed = originalParsePhoneNumber(number);
            expect(parsed.possible).toBe(true);
            const actual = parsePhoneNumber(number);
            expect(actual).toEqual({
                ...parsed,
                valid: false,
                possible: false,
                number: {
                    ...parsed.number,
                    input: parsed.number?.input ?? number,
                    e164: '+12345678901ext2',
                    international: '+12345678901ext2',
                    national: '+12345678901ext2',
                    rfc3966: 'tel:+12345678901ext2',
                    significant: '+12345678901ext2',
                },
            });
        });

        it('rewrites every number field for the extra US country-code digit', () => {
            // Given a parser-possible number that begins with the extra US digit
            // When the wrapper applies the special invalidation rule
            // Then its five number fields retain the existing invalid result format
            const number = '+112345678901';
            const parsed = originalParsePhoneNumber(number);
            expect(parsed.possible).toBe(true);
            expect(parsePhoneNumber(number)).toEqual({
                ...parsed,
                valid: false,
                possible: false,
                number: {
                    ...parsed.number,
                    input: parsed.number?.input ?? number,
                    e164: number,
                    international: '+1 12345678901',
                    national: '12345678901',
                    rfc3966: 'tel:+1-12345678901',
                    significant: '12345678901',
                },
            });
        });

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

    describe('addSMSDomainIfPhoneNumber', () => {
        it('adds the SMS domain only to possible phone logins', () => {
            // Given a valid phone, an invalid special-case number, and an email
            // When each login is normalized for SMS
            // Then only the possible phone receives the SMS domain
            expect(addSMSDomainIfPhoneNumber('+12345678901')).toBe('+12345678901@expensify.sms');
            expect(addSMSDomainIfPhoneNumber('+112345678901')).toBe('+112345678901');
            expect(addSMSDomainIfPhoneNumber('person@example.com')).toBe('person@example.com');
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
