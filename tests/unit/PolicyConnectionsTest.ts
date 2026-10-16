import {openPolicyRecruitingPage} from '@libs/actions/PolicyConnections';
import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');

const mockRead = jest.mocked(read);
const policyID = 'policyID';
const hasConnectionsDataBeenFetchedKey = `${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${policyID}` as const;

describe('PolicyConnections', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('openPolicyRecruitingPage', () => {
        it('reads the recruiting page and records whether the connections data was fetched', () => {
            // When the openPolicyRecruitingPage is called
            openPolicyRecruitingPage(policyID);

            // Then the recruiting page data is read, and the "data fetched" flag is set on success and cleared on failure
            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_POLICY_RECRUITING_PAGE,
                {policyID},
                {
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: hasConnectionsDataBeenFetchedKey,
                            value: true,
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: hasConnectionsDataBeenFetchedKey,
                            value: false,
                        },
                    ],
                },
            );
        });
    });
});
