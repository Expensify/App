import {measureFunction} from 'reassure';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicyMember from '../utils/collections/policyMembers';

describe('PolicyUtils', () => {
    describe('getMemberAccountIDsForWorkspace', () => {
        test('500 policy members with personal details', async () => {
            const policyMembers = createCollection(
                (_, index) => index,
                () => createRandomPolicyMember(),
            );

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers));
        });

        test('500 policy members with errors and personal details', async () => {
            const policyMembers = createCollection(
                (_, index) => index,
                () => ({
                    ...createRandomPolicyMember(),
                    errors: {error: 'Error message'},
                }),
            );

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers));
        });
    });
});
