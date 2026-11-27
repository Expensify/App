import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {updateCampfireAutoCreateVendor} from '@src/libs/actions/connections/Campfire';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(),
    },
}));

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}` as const;

// Asymmetric matchers are typed `any`. Bind them to `unknown` so they can be nested inside `toMatchObject` payloads without tripping `no-unsafe-assignment`.
const ANY_VALUE: unknown = expect.anything();

/** Returns the `onyxData` argument (third param) passed to the first `API.write` call. */
function getFirstWriteOnyxData() {
    return writeSpy.mock.calls.at(0)?.[2];
}

describe('actions/connections/Campfire', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateCampfireAutoCreateVendor', () => {
        it('writes the command with the selected toggle state', () => {
            // Given an admin enabling automatic vendor creation in Campfire Advanced settings

            // When the toggle is turned on
            updateCampfireAutoCreateVendor(MOCK_POLICY_ID, true, false);

            // Then the backend receives the enabled flag
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_CAMPFIRE_AUTO_CREATE_VENDOR, {policyID: MOCK_POLICY_ID, enabled: true}, expect.anything());
        });

        it('updates export.autoCreateVendor optimistically and rolls back on failure', () => {
            // Given Auto-create vendors is currently disabled

            // When the admin enables the toggle
            updateCampfireAutoCreateVendor(MOCK_POLICY_ID, true, false);

            // Then the new value is written optimistically and failure restores false with an error
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                campfire: {
                                    config: {
                                        export: {[CONST.CAMPFIRE_CONFIG.AUTO_CREATE_VENDOR]: true},
                                        pendingFields: {[CONST.CAMPFIRE_CONFIG.AUTO_CREATE_VENDOR]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                    },
                                },
                            },
                        },
                    },
                ],
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                campfire: {
                                    config: {
                                        export: {[CONST.CAMPFIRE_CONFIG.AUTO_CREATE_VENDOR]: false},
                                        errorFields: {[CONST.CAMPFIRE_CONFIG.AUTO_CREATE_VENDOR]: ANY_VALUE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });
    });
});
