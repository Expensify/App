import getInvitedEmailsToAccountIDs from '@pages/InviteReportParticipantsPageUtils';

describe('InviteReportParticipantsPage', () => {
    describe('getInvitedEmailsToAccountIDs', () => {
        it('preserves optimistic account IDs for new invitees', () => {
            // Given a typed invitee that does not have a real account yet
            const login = 'new-user@example.com';
            const selectedOptions = [
                {
                    login,
                    accountID: 0,
                },
            ];

            // When building the invite map
            const invitedEmailsToAccountIDs = getInvitedEmailsToAccountIDs(selectedOptions);

            // Then the optimistic accountID is preserved for the API layer
            expect(Object.entries(invitedEmailsToAccountIDs)).toStrictEqual([[login, 0]]);
        });

        it('skips malformed selected options', () => {
            // Given selected options that cannot be invited
            const selectedOptions = [
                {
                    accountID: 123,
                },
                {
                    login: 'missing-account-id@example.com',
                },
            ];

            // When building the invite map
            const invitedEmailsToAccountIDs = getInvitedEmailsToAccountIDs(selectedOptions);

            // Then no invalid invitee is sent to the API layer
            expect(invitedEmailsToAccountIDs).toStrictEqual({});
        });
    });
});
