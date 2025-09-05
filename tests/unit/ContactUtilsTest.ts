import {sortEmailObjects} from '@src/libs/ContactUtils';
import {localeCompare} from '../utils/TestHelper';

describe('ContactUtils', () => {
    describe('sortEmailObjects', () => {
        it('Should sort email objects with Expensify emails first', () => {
            const emails = [{value: 'user2@gmail.com'}, {value: 'user2@expensify.com'}, {value: 'user1@gmail.com'}, {value: 'user1@expensify.com'}];
            const sortedEmails = sortEmailObjects(emails, localeCompare);
            expect(sortedEmails).toEqual(['user1@expensify.com', 'user2@expensify.com', 'user1@gmail.com', 'user2@gmail.com']);
        });
    });
});
