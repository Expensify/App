import {syncMerge} from '@libs/actions/connections/merge';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);
const policyID = 'policyID';
const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
const connectionName = CONST.POLICY.CONNECTIONS.NAME.MERGE_HR;

function makePolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(1),
        id: policyID,
        ...overrides,
    };
}

describe('MergeActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('syncMerge', () => {
        it('clears a leftover isConfigurationError so an unrelated failure is not mistaken for an already-fixed one', () => {
            // Given a connection whose last sync failed because of its settings
            const policy = makePolicy({
                connections: {
                    [connectionName]: {
                        config: {integration: 'workday', approvalMode: null, finalApprover: null, groups: null},
                        lastSync: {isAuthenticationError: false, isSuccessful: false, source: 'NEWEXPENSIFY', isConfigurationError: true},
                    },
                },
            });

            // When the admin manually syncs again
            syncMerge(policy, connectionName);

            // Then both the optimistic and failure updates clear the flag, so a later unrelated failure is reported
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SYNC_POLICY_TO_MERGE,
                {policyID, connectionName},
                expect.objectContaining({
                    optimisticData: [
                        expect.objectContaining({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: expect.objectContaining({
                                connections: {
                                    [connectionName]: expect.objectContaining({
                                        lastSync: expect.objectContaining({isConfigurationError: false}),
                                    }),
                                },
                            }),
                        }),
                    ],
                    failureData: [
                        expect.objectContaining({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: policyKey,
                            value: expect.objectContaining({
                                connections: {
                                    [connectionName]: expect.objectContaining({
                                        lastSync: expect.objectContaining({isConfigurationError: false}),
                                    }),
                                },
                            }),
                        }),
                    ],
                }),
            );
        });

        it('does nothing when the policy has no id', () => {
            // Given a policy that has not finished loading
            // When a sync is attempted
            syncMerge(undefined, connectionName);

            // Then no API call is made
            expect(mockWrite).not.toHaveBeenCalled();
        });
    });
});
