import {measureFunction} from 'reassure';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicyEmployeeList from '../utils/collections/policyEmployeeList';

describe('PolicyUtils', () => {
    describe('getMemberAccountIDsForWorkspace', () => {
        test('500 policy members with personal details', async () => {
            const policyEmployeeList = createCollection(
                (_, index) => index,
                () => createRandomPolicyEmployeeList(),
            );

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyEmployeeList));
        });

        test('500 policy members with errors and personal details', async () => {
            const policyEmployeeList = createCollection(
                (_, index) => index,
                () => ({
                    ...createRandomPolicyEmployeeList(),
                    errors: {error: 'Error message'},
                }),
            );

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyEmployeeList));
        });
    });
});
