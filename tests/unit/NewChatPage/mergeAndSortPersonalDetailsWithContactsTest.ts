import type {SearchOption} from '@libs/OptionsListUtils';
import mergeAndSortPersonalDetailsWithContacts from '@pages/NewChatPage/mergeAndSortPersonalDetailsWithContacts';
import type {PersonalDetails} from '@src/types/onyx';

describe('mergeAndSortPersonalDetailsWithContacts', () => {
    it('sorts the merged set alphabetically by the personalDetailsComparator key', () => {
        const onyx = [
            {login: 'zara@x.com', accountID: 1, text: 'Zara'},
            {login: 'bob@x.com', accountID: 2, text: 'Bob'},
        ] as Array<SearchOption<PersonalDetails>>;
        const contacts = [{login: 'aaron@x.com', accountID: 999, text: 'Aaron'}] as Array<SearchOption<PersonalDetails>>;

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result.map((option) => option.text)).toEqual(['Aaron', 'Bob', 'Zara']);
    });

    it('dedupes by login case-insensitively', () => {
        const onyx = [{login: 'john@x.com', accountID: 1, text: 'John Onyx'}] as Array<SearchOption<PersonalDetails>>;
        const contacts = [{login: 'JOHN@x.com', accountID: 999, text: 'John Contact'}] as Array<SearchOption<PersonalDetails>>;

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result).toHaveLength(1);
    });

    it('prefers the Onyx personal-detail copy over the contact copy on a login collision', () => {
        const onyx = [{login: 'john@x.com', accountID: 12345, text: 'John Onyx'}] as Array<SearchOption<PersonalDetails>>;
        const contacts = [{login: 'john@x.com', accountID: 99999, text: 'John Contact'}] as Array<SearchOption<PersonalDetails>>;

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result.at(0)?.accountID).toBe(12345);
        expect(result.at(0)?.text).toBe('John Onyx');
    });

    it('dedupes phone-number logins regardless of SMS-domain suffix', () => {
        const onyx = [{login: '+12025550100@expensify.sms', accountID: 1, text: 'Phone Onyx'}] as Array<SearchOption<PersonalDetails>>;
        const contacts = [{login: '+12025550100', accountID: 999, text: 'Phone Contact'}] as Array<SearchOption<PersonalDetails>>;

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, contacts);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.accountID).toBe(1);
    });

    it('drops entries with empty login', () => {
        const onyx = [
            {login: '', accountID: 1, text: 'Anon'},
            {login: 'a@x.com', accountID: 2, text: 'Alice'},
        ] as Array<SearchOption<PersonalDetails>>;

        const result = mergeAndSortPersonalDetailsWithContacts(onyx, []);

        expect(result.map((option) => option.login)).toEqual(['a@x.com']);
    });
});
