// eslint-disable-next-line no-restricted-syntax
import * as Session from '@libs/actions/Session';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';

jest.mock('@libs/actions/Session', () => ({
    isAnonymousUser: jest.fn(),
    signOutAndRedirectToSignIn: jest.fn(),
}));

describe('interceptAnonymousUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls signOutAndRedirectToSignIn with activePolicyID when user is anonymous', () => {
        (Session.isAnonymousUser as jest.Mock).mockReturnValue(true);
        const callback = jest.fn();

        interceptAnonymousUser(callback, 'policy-123');

        expect(Session.signOutAndRedirectToSignIn).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, 'policy-123');
        expect(callback).not.toHaveBeenCalled();
    });

    it('calls signOutAndRedirectToSignIn with undefined activePolicyID when not provided', () => {
        (Session.isAnonymousUser as jest.Mock).mockReturnValue(true);
        const callback = jest.fn();

        interceptAnonymousUser(callback);

        expect(Session.signOutAndRedirectToSignIn).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, undefined);
        expect(callback).not.toHaveBeenCalled();
    });

    it('executes callback and does not sign out when user is not anonymous', () => {
        (Session.isAnonymousUser as jest.Mock).mockReturnValue(false);
        const callback = jest.fn();

        interceptAnonymousUser(callback, 'policy-123');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(Session.signOutAndRedirectToSignIn).not.toHaveBeenCalled();
    });
});
