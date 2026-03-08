import {buildMemberInviteSections} from '@hooks/useMemberInviteSections';
import type {Options} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';

const translate = (path: 'common.contacts') => {
    if (path === 'common.contacts') {
        return 'Contacts';
    }

    return path;
};

function createOption(key: string, overrides: Partial<OptionData> = {}): OptionData {
    return {
        keyForList: key,
        text: key,
        login: `${key}@example.com`,
        isSelected: false,
        ...overrides,
    };
}

function createSearchOptions(personalDetails: OptionData[], userToInvite: OptionData | null = null): Options {
    return {
        personalDetails,
        userToInvite,
        recentReports: [],
        currentUserOption: null,
    };
}

describe('useMemberInviteSections', () => {
    it('shows a frozen initial-selected section above threshold and keeps deselected initial items in place', () => {
        const initialSelectedOptions = [createOption('user-2', {isSelected: true}), createOption('user-5', {isSelected: true})];
        const selectedOptions = [createOption('user-5', {isSelected: true})];
        const searchOptions = createSearchOptions([
            createOption('user-2', {isSelected: false}),
            createOption('user-5', {isSelected: true}),
            createOption('user-1'),
            createOption('user-3'),
            createOption('user-4'),
            createOption('user-6'),
            createOption('user-7'),
            createOption('user-8'),
            createOption('user-9'),
        ]);

        const sections = buildMemberInviteSections({
            searchTerm: '',
            searchOptions,
            selectedOptions,
            initialSelectedOptions,
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(2);
        expect(sections.at(0)?.data.map((option) => option.keyForList)).toEqual(['user-2', 'user-5']);
        expect(sections.at(0)?.data.map((option) => option.isSelected)).toEqual([false, true]);
        expect(sections.at(1)?.title).toBe('Contacts');
        expect(sections.at(1)?.data.map((option) => option.keyForList)).toEqual(['user-1', 'user-3', 'user-4', 'user-6', 'user-7', 'user-8', 'user-9']);
    });

    it('keeps newly selected rows in place when there is no initial selected section', () => {
        const searchOptions = createSearchOptions([createOption('user-1'), createOption('user-2', {isSelected: true}), createOption('user-3')]);

        const sections = buildMemberInviteSections({
            searchTerm: '',
            searchOptions,
            selectedOptions: [createOption('user-2', {isSelected: true})],
            initialSelectedOptions: [],
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(1);
        expect(sections.at(0)?.title).toBe('Contacts');
        expect(sections.at(0)?.data.map((option) => option.keyForList)).toEqual(['user-1', 'user-2', 'user-3']);
        expect(sections.at(0)?.data.at(1)?.isSelected).toBe(true);
    });

    it('hides the frozen selected section while searching and only returns matching results', () => {
        const sections = buildMemberInviteSections({
            searchTerm: 'ali',
            searchOptions: createSearchOptions([createOption('alice', {isSelected: true})], createOption('invite-alice')),
            selectedOptions: [createOption('alice', {isSelected: true})],
            initialSelectedOptions: [createOption('alice', {isSelected: true})],
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(2);
        expect(sections.at(0)?.title).toBe('Contacts');
        expect(sections.at(0)?.data.map((option) => option.keyForList)).toEqual(['alice']);
        expect(sections.at(1)?.data.map((option) => option.keyForList)).toEqual(['invite-alice']);
    });

    it('bypasses top reordering for small lists', () => {
        const initialSelectedOptions = [createOption('user-2', {isSelected: true})];
        const searchOptions = createSearchOptions([createOption('user-1'), createOption('user-2', {isSelected: true}), createOption('user-3')]);

        const sections = buildMemberInviteSections({
            searchTerm: '',
            searchOptions,
            selectedOptions: initialSelectedOptions,
            initialSelectedOptions,
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(1);
        expect(sections.at(0)?.title).toBe('Contacts');
        expect(sections.at(0)?.data.map((option) => option.keyForList)).toEqual(['user-1', 'user-2', 'user-3']);
    });

    it('still shows draft-only invitees even when the list is below threshold', () => {
        const initialSelectedOptions = [createOption('draft-only', {isSelected: true})];

        const sections = buildMemberInviteSections({
            searchTerm: '',
            searchOptions: createSearchOptions([createOption('user-1'), createOption('user-2'), createOption('user-3')]),
            selectedOptions: initialSelectedOptions,
            initialSelectedOptions,
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(2);
        expect(sections.at(0)?.data.map((option) => option.keyForList)).toEqual(['draft-only']);
        expect(sections.at(1)?.data.map((option) => option.keyForList)).toEqual(['user-1', 'user-2', 'user-3']);
    });

    it('dedupes a login-keyed initial selection against an account-keyed contact row', () => {
        const initialSelectedOptions = [createOption('same@example.com', {text: 'same@example.com', login: 'same@example.com', isSelected: true})];
        const selectedOptions = [createOption('123', {accountID: 123, text: 'same@example.com', login: 'same@example.com', isSelected: true})];
        const searchOptions = createSearchOptions([
            createOption('123', {accountID: 123, text: 'same@example.com', login: 'same@example.com', isSelected: true}),
            createOption('user-1'),
            createOption('user-2'),
            createOption('user-3'),
            createOption('user-4'),
            createOption('user-5'),
            createOption('user-6'),
            createOption('user-7'),
            createOption('user-8'),
        ]);

        const sections = buildMemberInviteSections({
            searchTerm: '',
            searchOptions,
            selectedOptions,
            initialSelectedOptions,
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(2);
        expect(sections.at(0)?.data.map((option) => option.keyForList)).toEqual(['same@example.com']);
        expect(sections.at(0)?.data.at(0)?.isSelected).toBe(true);
        expect(sections.at(1)?.data.map((option) => option.keyForList)).toEqual(['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8']);
    });

    it('keeps a new user-to-invite row visible in place when selected during the session', () => {
        const userToInvite = createOption('new-user', {isSelected: true});

        const sections = buildMemberInviteSections({
            searchTerm: '',
            searchOptions: createSearchOptions(
                [
                    createOption('user-1'),
                    createOption('user-2'),
                    createOption('user-3'),
                    createOption('user-4'),
                    createOption('user-5'),
                    createOption('user-6'),
                    createOption('user-7'),
                    createOption('user-8'),
                    createOption('user-9'),
                ],
                userToInvite,
            ),
            selectedOptions: [userToInvite],
            initialSelectedOptions: [],
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(2);
        expect(sections.at(1)?.data.map((option) => option.keyForList)).toEqual(['new-user']);
        expect(sections.at(1)?.data.at(0)?.isSelected).toBe(true);
    });
});
