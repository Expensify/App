import * as Policy from '../../src/libs/actions/Policy';

describe('Policy', () => {
    describe('generateDefaultWorkspaceName', () => {
        test('withAnInvalidEmail', () => {
            const email = 'thisisaninvalidemail';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('');
        });

        test('withAnSMSEmail', () => {
            const email = 'doe@expensify.sms';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('My Group Workspace');
        });

        test('withAPublicDomainEmail', () => {
            const email = 'doe@gmail.com';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('Doe\'s Workspace');
        });

        test('withANonPublicDomainEmail', () => {
            const email = 'doe@someprivatecompany.com';
            expect(Policy.generateDefaultWorkspaceName(email)).toBe('Someprivatecompany\'s Workspace');
        });
    });
});
