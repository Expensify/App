import getDecodedContactMethodFromUriParam from '@pages/settings/Profile/Contacts/utils';

describe('getDecodedContactMethodFromUriParam', () => {
    it('returns an email containing a literal % without throwing', () => {
        // Given a route param the router already decoded, for an email whose `%al` is not a valid escape sequence
        const contactMethodParam = 'test%alias@gmail.com';

        // When the contact method details page reads it
        const contactMethod = getDecodedContactMethodFromUriParam(contactMethodParam);

        // Then the email is kept as-is, because decoding it a second time would throw a URIError and crash the page
        expect(contactMethod).toBe('test%alias@gmail.com');
    });

    it('does not decode valid escape sequences a second time', () => {
        // Given an already-decoded email that happens to contain a valid escape sequence
        const contactMethodParam = 'a%41b@x.com';

        // When the contact method details page reads it
        const contactMethod = getDecodedContactMethodFromUriParam(contactMethodParam);

        // Then the email is kept as-is, because turning `%41` into `A` would make the login lookup miss
        expect(contactMethod).toBe('a%41b@x.com');
    });

    it('returns a regular email unchanged', () => {
        // Given a regular email route param
        const contactMethodParam = 'test@gmail.com';

        // When the contact method details page reads it
        const contactMethod = getDecodedContactMethodFromUriParam(contactMethodParam);

        // Then the email matches the login key stored in the login list
        expect(contactMethod).toBe('test@gmail.com');
    });

    it('adds the SMS domain to a phone number', () => {
        // Given a phone number route param, which is stored in the login list with the SMS domain
        const contactMethodParam = '+15005550006';

        // When the contact method details page reads it
        const contactMethod = getDecodedContactMethodFromUriParam(contactMethodParam);

        // Then the SMS domain is added so the login lookup finds the phone number
        expect(contactMethod).toBe('+15005550006@expensify.sms');
    });
});
