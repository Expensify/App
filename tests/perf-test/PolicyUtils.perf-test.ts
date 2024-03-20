import {measureFunction} from 'reassure';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import type {PersonalDetails, PolicyMember} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicyMember from '../utils/collections/policyMembers';

describe('PolicyUtils', () => {
    describe('getMemberAccountIDsForWorkspace', () => {
        test('500 policy members with personal details', async () => {
            const policyMembers = createCollection<PolicyMember>(
                (_, index) => index,
                () => createRandomPolicyMember(),
            );
            const personalDetails = createCollection<PersonalDetails>((_, index) => index, createPersonalDetails);

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
        });

        test('500 policy members with errors and personal details', async () => {
            const policyMembers = createCollection<PolicyMember>(
                (_, index) => index,
                () => ({
                    ...createRandomPolicyMember(),
                    errors: {error: 'Error message'},
                }),
            );
            const personalDetails = createCollection<PersonalDetails>((_, index) => index, createPersonalDetails);

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
        });
    });
});
