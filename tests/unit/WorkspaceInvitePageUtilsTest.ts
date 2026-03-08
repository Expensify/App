import buildInitialWorkspaceInviteOptions from '@pages/workspace/WorkspaceInvitePageUtils';

describe('WorkspaceInvitePageUtils', () => {
    it('hydrates draft invitees with the canonical personal detail accountID when the draft stores 0', () => {
        const login = 'same@example.com';
        const accountID = '123';
        const options = buildInitialWorkspaceInviteOptions(
            {
                [login]: 0,
            },
            {
                [accountID]: {
                    accountID: 123,
                    login,
                    displayName: login,
                    avatar: '',
                },
            },
        );

        expect(options).toHaveLength(1);
        expect(options.at(0)?.accountID).toBe(123);
        expect(options.at(0)?.keyForList).toBe(accountID);
        expect(options.at(0)?.login).toBe(login);
        expect(options.at(0)?.text).toBe(login);
    });
});
