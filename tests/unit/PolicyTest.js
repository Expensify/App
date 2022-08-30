import * as Policy from '../../src/libs/actions/Policy';

describe('Policy', () => {
    describe('generateDefaultWorkspaceNameWithNoPolicy', () => {
        test('withAnInvalidEmailAndNoPolicy', () => {
            const email = 'thisisaninvalidemail';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('');
        });

        test('withAnSMSEmailAndNoPolicies', () => {
            const email = '+15033155123@expensify.sms';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('My Group Workspace');
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

        test('withAnSMSEmailWithPolicies', () => {
            const email = '+15033155123@expensify.sms';
            const policies = [
                {
                    name: 'My Group Workspace',
                },
                {
                    name: 'My Group Workspace 1',
                },
                {
                    name: 'Test Policy 3',
                },
                {
                    name: 'Test Policy 4',
                },
            ];
            expect(Policy.generateDefaultWorkspaceName(email, policies)).toBe('My Group Workspace 2');
        });

        test('withAPublicDomainEmailWithPolicies', () => {
            const email = 'doe@gmail.com';
            const policies = [
                {
                    name: 'Doe\'s Workspace',
                },
                {
                    name: 'Doe\'s Workspace 1',
                },
                {
                    name: 'Doe\'s Workspace 2',
                },
                {
                    name: 'Doe\'s Workspace 3',
                },
            ];
            expect(Policy.generateDefaultWorkspaceName(email, policies)).toBe('Doe\'s Workspace 4');
        });

        test('withANonPublicDomainEmailAndSevenPolicies', () => {
            const email = 'doe@someprivatecompany.com';
            const policies = [
                {
                    name: 'Someprivatecompany\'s Workspace',
                },
                {
                    name: 'Someprivatecompany\'s Workspace 1',
                },
                {
                    name: 'Someprivatecompany\'s Workspace 2',
                },
                {
                    name: 'Doe\'s Workspace 3',
                },
            ];
            expect(Policy.generateDefaultWorkspaceName(email, policies)).toBe('Someprivatecompany\'s Workspace 3');
        });
    });
});
