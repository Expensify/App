import * as Policy from '../../src/libs/actions/Policy';

jest.mock('../../src/libs/actions/Policy', () => ({
    __esModule: true,
    getAllPolicies: jest.fn().mockReturnValue([
        {
            name: 'My Group Workspace',
        },
        {
            name: 'Test Policy 2',
        },
        {
            name: 'Test Policy 3',
        },
        {
            name: 'Test Policy 4',
        },
    ]),
}));

describe('Policy', () => {
    describe('generateDefaultWorkspaceNameWithNoPolicy', () => {
        test('withAnInvalidEmailAndNoPolicy', () => {
            const email = 'thisisaninvalidemail';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('');
        });

        test('withAnSMSEmailAndNoPolicy', () => {
            const email = '+15033155123@expensify.sms';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('My Group Workspace 1');
        });

        test('withAPublicDomainEmailAndNoPolicy', () => {
            const email = 'doe@gmail.com';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('Doe\'s Workspace');
        });

        test('withANonPublicDomainEmailAndNoPolicy', () => {
            const email = 'doe@someprivatecompany.com';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('Someprivatecompany\'s Workspace');
        });
    });

    describe('generateDefaultWorkspaceNameWithPolicies', () => {
        test('withAnInvalidEmailWithOnePolicy', () => {
            const email = 'thisisaninvalidemail';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('');
        });

        test('withAnSMSEmailAndThreePolicies', () => {
            const email = '+15033155123@expensify.sms';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('My Group Workspace 4');
        });

        test('withAPublicDomainEmailAndFourPolicies', () => {
            const email = 'doe@gmail.com';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('Doe\'s Workspace 5');
        });

        test('withANonPublicDomainEmailAndSevenPolicies', () => {
            const email = 'doe@someprivatecompany.com';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('Someprivatecompany\'s Workspace 8');
        });
    });
});
