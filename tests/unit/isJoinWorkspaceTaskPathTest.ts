import isJoinWorkspaceTaskPath, {isOnboardingPath} from '@libs/Navigation/helpers/isJoinWorkspaceTaskPath';

describe('isJoinWorkspaceTaskPath', () => {
    it.each(['onboarding/work-email?isJoinWorkspaceTask=true', '/onboarding/work-email-validation?isJoinWorkspaceTask=true', 'onboarding/join-workspaces?isJoinWorkspaceTask=true'])(
        'accepts the exact task route %s',
        (path) => {
            expect(isJoinWorkspaceTaskPath(path)).toBe(true);
        },
    );

    it.each([
        'onboarding',
        'onboarding?isJoinWorkspaceTask=true',
        'onboarding/work-email?foo=isJoinWorkspaceTask=true',
        'onboarding/work-email?isJoinWorkspaceTask=false',
        'onboarding/work-email-invalid?isJoinWorkspaceTask=true',
    ])('rejects the non-task route %s', (path) => {
        expect(isJoinWorkspaceTaskPath(path)).toBe(false);
    });
});

describe('isOnboardingPath', () => {
    it.each(['onboarding', '/onboarding', 'onboarding/work-email?foo=bar'])('accepts the onboarding route %s', (path) => {
        expect(isOnboardingPath(path)).toBe(true);
    });

    it.each(['', 'home', 'onboarding-invalid'])('rejects the non-onboarding route %s', (path) => {
        expect(isOnboardingPath(path)).toBe(false);
    });
});
