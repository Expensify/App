import {measureFunction} from 'reassure';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import PolicyMember from '@src/types/onyx/PolicyMember';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyMember from '../utils/collections/policyMembers';

describe('[PolicyUtils] Performance tests for getMemberAccountIDsForWorkspace', () => {
    test('With multiple members with personal details and policy members', async () => {
        const policyMembers = createCollection < PolicyMember > ((item, index) => `policyMembers_${index}`, (index) => ({...createRandomPolicyMember(index)}));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, createPersonalDetails(i)]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });

    test('With multiple members with empty personal details and with errors in policy members', async () => {
        const policyMembers = createCollection < PolicyMember > ((item, index) => `policyMembers_${index}`, (index) => ({...createRandomPolicyMember(index), errors: {someError: true}}));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {}]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });

    test('With multiple members with personal details and with errors in policy members', async () => {
        const policyMembers = createCollection < PolicyMember > ((item, index) => `policyMembers_${index}`, (index) => ({...createRandomPolicy(index), errors: {someError: true}}));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, createPersonalDetails(i)]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });

    test('With multiple members with empty personal details and with policy members', async () => {
        const policyMembers = createCollection < PolicyMember > ((item, index) => `policyMembers_${index}`, (index) => ({...createRandomPolicyMember(index)}));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {}]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(policyMembers, personalDetails));
    });
});
