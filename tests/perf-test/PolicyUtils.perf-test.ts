import {measureFunction} from 'reassure';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import type {PersonalDetails, PolicyMember} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicyMember from '../utils/collections/policyMembers';

describe('[PolicyUtils] Performance tests for getMemberAccountIDsForWorkspace', () => {
    test('With multiple members with personal details and policy members', async () => {
        const policyMembers = createCollection<PolicyMember>(
            (_, index) => `policyMembers_${index}`,
            () => createRandomPolicyMember(),
        );
        const personalDetails = createCollection<PersonalDetails>((_, index: number) => `personalDetails_${index}`, createPersonalDetails);

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });

    test('With multiple members with empty personal details and with errors in policy members', async () => {
        const policyMembers = createCollection<PolicyMember>(
            (_, index) => `policyMembers_${index}`,
            () => ({
                ...createRandomPolicyMember(),
                errors: {error: 'Error message'},
            }),
        );
        const personalDetails = createCollection<PersonalDetails>(
            (_, index) => `personalDetails_${index}`,
            (index) => ({
                accountID: index,
            }),
        );

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });

    test('With multiple members with personal details and with errors in policy members', async () => {
        const policyMembers = createCollection<PolicyMember>(
            (_, index) => `policyMembers_${index}`,
            () => ({
                ...createRandomPolicyMember(),
                errors: {error: 'Error message'},
            }),
        );
        const personalDetails = createCollection<PersonalDetails>((_, index) => `personalDetails_${index}`, createPersonalDetails);

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });

    test('With multiple members with empty personal details and with policy members', async () => {
        const policyMembers = createCollection<PolicyMember>(
            (_, index) => `policyMembers_${index}`,
            () => createRandomPolicyMember(),
        );
        const personalDetails = createCollection<PersonalDetails>(
            (_, index) => `personalDetails_${index}`,
            (index) => ({
                accountID: index,
            }),
        );

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });
});
