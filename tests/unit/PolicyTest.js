import * as Policy from '../../src/libs/actions/Policy';

describe('Policy', () => {
    describe('generateDefaultWorkspaceNameWithNoPolicy', () => {
        test('withAnInvalidEmailAndNoPolicy', () => {
            const email = 'thisisaninvalidemail';
            const policyList = [];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('');
        });

        test('withAnSMSEmailAndNoPolicy', () => {
            const email = '+15033155123@expensify.sms';
            const policyList = [];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('My Group Workspace');
        });

        test('withAPublicDomainEmailAndNoPolicy', () => {
            const email = 'doe@gmail.com';
            const policyList = [];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('Doe\'s Workspace');
        });

        test('withANonPublicDomainEmailAndNoPolicy', () => {
            const email = 'doe@someprivatecompany.com';
            const policyList = [];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('Someprivatecompany\'s Workspace');
        });
    });

    describe('generateDefaultWorkspaceNameWithPolicies', () => {
        test('withAnInvalidEmailWithOnePolicy', () => {
            const email = 'thisisaninvalidemail';
            const policyList = [
                {
                    name: 'Test Policy 1',
                },
            ];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('');
        });

        test('withAnSMSEmailAndThreePolicies', () => {
            const email = '+15033155123@expensify.sms';
            const policyList = [
                {
                    name: 'Test Policy 1',
                },
                {
                    name: 'Test Policy 2',
                },
                {
                    name: 'Test Policy 3',
                },
            ];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('My Group Workspace 4');
        });

        test('withAPublicDomainEmailAndFourPolicies', () => {
            const email = 'doe@gmail.com';
            const policyList = [
                {
                    name: 'Test Policy 1',
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
            ];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('Doe\'s Workspace 5');
        });

        test('withANonPublicDomainEmailAndSevenPolicies', () => {
            const email = 'doe@someprivatecompany.com';
            const policyList = [
                {
                    name: 'Test Policy 1',
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
                {
                    name: 'Test Policy 5',
                },
                {
                    name: 'Test Policy 6',
                },
                {
                    name: 'Test Policy 7',
                },
            ];
            expect(Policy.generateDefaultWorkspaceName(email, policyList)).toBe('Someprivatecompany\'s Workspace 8');
        });
    });
});
