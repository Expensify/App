import type {DeviceContact} from '@src/libs/ContactImport/types';
import {getContactsExtended, sortEmailObjects} from '@src/libs/ContactUtils';

import {formatPhoneNumber, localeCompare} from '../utils/TestHelper';

describe('ContactUtils', () => {
    describe('sortEmailObjects', () => {
        it('Should sort email objects with Expensify emails first', () => {
            const emails = [{value: 'user2@gmail.com'}, {value: 'user2@expensify.com'}, {value: 'user1@gmail.com'}, {value: 'user1@expensify.com'}];
            const sortedEmails = sortEmailObjects(emails, localeCompare);
            expect(sortedEmails).toEqual(['user1@expensify.com', 'user2@expensify.com', 'user1@gmail.com', 'user2@gmail.com']);
        });
    });

    describe('getContactsExtended', () => {
        const deviceContacts: DeviceContact[] = [
            {firstName: 'Fake', lastName: 'One', phoneNumbers: [{value: '(201) 555-0123'}]},
            {firstName: 'Fake', lastName: 'Two', emailAddresses: [{value: 'fake.two@example.com'}], phoneNumbers: [{value: '+1 201 555 0124'}]},
            {firstName: 'Fake', lastName: 'Three', phoneNumbers: [{value: '+44 20 8759 9036'}]},
            {firstName: 'Fake', lastName: 'Four', phoneNumbers: [{value: '2015550126'}]},
            {firstName: 'No', lastName: 'Number', phoneNumbers: [{value: '123'}]},
            {firstName: 'Current', lastName: 'User', phoneNumbers: [{value: '201-555-0125'}]},
        ];
        const currentUserLogin = '+12015550125@expensify.sms';
        const loginList = {[currentUserLogin]: {partnerUserID: currentUserLogin}};

        it('builds one row per contact with a valid phone number or email, in device order', () => {
            // Given device contacts in several phone formats, one without a valid number and one with the current user's number
            // When they are imported
            const contacts = getContactsExtended(deviceContacts, localeCompare, formatPhoneNumber, 1, loginList);

            // Then each remaining contact gets a row with its login, name, formatted number and the phone number from the device
            expect(contacts.map(({login, text, alternateText, phoneNumber}) => ({login, text, alternateText, phoneNumber}))).toEqual([
                {login: '+12015550123@expensify.sms', text: 'Fake One', alternateText: '(201) 555-0123', phoneNumber: '(201) 555-0123'},
                {login: 'fake.two@example.com', text: 'Fake Two', alternateText: 'fake.two@example.com', phoneNumber: '+1 201 555 0124'},
                {login: '+442087599036@expensify.sms', text: 'Fake Three', alternateText: '+44 20 8759 9036', phoneNumber: '+44 20 8759 9036'},
                {login: '+12015550126@expensify.sms', text: 'Fake Four', alternateText: '(201) 555-0126', phoneNumber: '2015550126'},
            ]);
            for (const contact of contacts) {
                expect(contact.item.login).toBe(contact.login);
                expect(contact.participantsList?.at(0)?.login).toBe(contact.login);
                expect(contact.keyForList).toBe(String(contact.accountID));
            }
        });

        it('builds the same rows when the same contacts are imported again', () => {
            // Given contacts that were already imported once
            const firstImport = getContactsExtended(deviceContacts, localeCompare, formatPhoneNumber, 1, loginList);

            // When the same contacts are imported again, as happens each time a contact list screen gains focus
            const secondImport = getContactsExtended(deviceContacts, localeCompare, formatPhoneNumber, 1, loginList);

            // Then the rows are identical
            expect(secondImport).toEqual(firstImport);
        });
    });
});
