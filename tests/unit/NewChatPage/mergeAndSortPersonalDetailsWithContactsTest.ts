import type {SearchOptionData} from '@libs/OptionsListUtils';

import mergeAndSortPersonalDetailsWithContacts from '@pages/NewChatPage/mergeAndSortPersonalDetailsWithContacts';

describe('mergeAndSortPersonalDetailsWithContacts', () => {
    it('sorts the merged set alphabetically by the personalDetailsComparator key', () => {
        const onyx: SearchOptionData[] = [
            {login: 'zara@x.com', accountID: 1, text: 'Zara', keyForList: '1', reportID: ''},
            {login: 'bob@x.com', accountID: 2, text: 'Bob', keyForList: '2', reportID: ''},
        ];
        const contacts: SearchOptionData[] = [{login: 'aaron@x.com', accountID: 999, text: 'Aaron', keyForList: '999', reportID: ''}];

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result.map((option) => option.text)).toEqual(['Aaron', 'Bob', 'Zara']);
    });

    it('dedupes by login case-insensitively', () => {
        const onyx: SearchOptionData[] = [{login: 'john@x.com', accountID: 1, text: 'John Onyx', keyForList: '1', reportID: ''}];
        const contacts: SearchOptionData[] = [{login: 'JOHN@x.com', accountID: 999, text: 'John Contact', keyForList: '999', reportID: ''}];

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result).toHaveLength(1);
    });

    it('prefers the Onyx personal-detail copy over the contact copy on a login collision', () => {
        const onyx: SearchOptionData[] = [{login: 'john@x.com', accountID: 12345, text: 'John Onyx', keyForList: '12345', reportID: ''}];
        const contacts: SearchOptionData[] = [{login: 'john@x.com', accountID: 99999, text: 'John Contact', keyForList: '99999', reportID: ''}];

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result.at(0)?.accountID).toBe(12345);
        expect(result.at(0)?.text).toBe('John Onyx');
    });

    it('dedupes phone-number logins regardless of SMS-domain suffix', () => {
        const onyx: SearchOptionData[] = [{login: '+12025550100@expensify.sms', accountID: 1, text: 'Phone Onyx', keyForList: '1', reportID: ''}];
        const contacts: SearchOptionData[] = [{login: '+12025550100', accountID: 999, text: 'Phone Contact', keyForList: '999', reportID: ''}];

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.accountID).toBe(1);
    });

    it('drops entries with empty login', () => {
        const onyx: SearchOptionData[] = [
            {login: '', accountID: 1, text: 'Anon', keyForList: '1', reportID: ''},
            {login: 'a@x.com', accountID: 2, text: 'Alice', keyForList: '2', reportID: ''},
        ];

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, []);

        expect(result.map((option) => option.login)).toEqual(['a@x.com']);
    });
});
