import {resolveInitialSelectedAccountOptions, resolveInitialSelectedOptions} from '@components/Search/SearchFiltersParticipantsSelectorUtils';
import CONST from '@src/CONST';

function buildSearchOption(accountID: number, login: string, text: string, keyForList: string) {
    return {
        reportID: '',
        accountID,
        login,
        text,
        displayName: text,
        alternateText: login,
        keyForList,
        icons: [],
    };
}

describe('SearchFiltersParticipantsSelectorUtils', () => {
    it('resolves account-based initial selections against live option rows with stable keys', () => {
        const result = resolveInitialSelectedOptions({
            initialAccountIDs: ['1'],
            currentUserOption: buildSearchOption(1, 'current@test.com', 'Current User', 'current-user'),
            recentReports: [],
            personalDetailsOptions: [],
            userToInvite: null,
            personalDetails: Object.fromEntries([
                [
                    1,
                    {
                        accountID: 1,
                        login: 'current@test.com',
                        displayName: 'Current User',
                        avatar: 'avatar-url',
                    },
                ],
            ]),
            recentAttendees: [],
            shouldAllowNameOnlyOptions: false,
        });

        expect(result).toEqual([
            expect.objectContaining({
                accountID: 1,
                login: 'current@test.com',
                text: 'Current User',
                keyForList: 'current-user',
                reportID: '',
                isSelected: true,
                selected: true,
            }),
        ]);
    });

    it('falls back to a visible attendee option for name-only identifiers when no live row exists', () => {
        const result = resolveInitialSelectedOptions({
            initialAccountIDs: ['Name Only'],
            currentUserOption: null,
            recentReports: [],
            personalDetailsOptions: [],
            userToInvite: null,
            personalDetails: {},
            recentAttendees: [
                {
                    displayName: 'Name Only',
                    email: '',
                    login: '',
                    avatarUrl: 'avatar-url',
                    searchText: 'name only',
                },
            ],
            shouldAllowNameOnlyOptions: true,
        });

        expect(result).toEqual([
            expect.objectContaining({
                text: 'Name Only',
                displayName: 'Name Only',
                isSelected: true,
                selected: true,
                reportID: '',
                accountID: CONST.DEFAULT_NUMBER_ID,
                icons: [expect.objectContaining({source: 'avatar-url'})],
            }),
        ]);
    });

    it('creates a visible fallback for account-based identifiers when no live row exists', () => {
        const result = resolveInitialSelectedAccountOptions({
            initialAccountIDs: ['999'],
            currentUserOption: null,
            recentReports: [],
            personalDetailsOptions: [],
            userToInvite: null,
            personalDetails: {},
        });

        expect(result).toEqual([
            expect.objectContaining({
                text: '999',
                accountID: 999,
                keyForList: '999',
                reportID: '',
                isSelected: true,
                selected: true,
            }),
        ]);
    });
});
