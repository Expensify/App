import {updateCompanyCardName} from '@libs/actions/CompanyCards';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/API');

const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 1234567;
const CARD_ID = '99';
const BANK = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

const mockWrite = jest.mocked(write);

function getOptimisticKeys(): string[] {
    const call = mockWrite.mock.calls.at(0);
    if (!call) {
        throw new Error('write was not called');
    }
    const onyxData: unknown = call.at(2);
    if (!isRecord(onyxData)) {
        throw new Error('Missing onyx data');
    }
    const {optimisticData} = onyxData;
    if (!Array.isArray(optimisticData)) {
        throw new Error('Missing optimistic data');
    }
    return optimisticData.map((update: unknown) => {
        if (!isRecord(update) || typeof update.key !== 'string') {
            throw new Error('Invalid update entry — expected object with string key');
        }
        return update.key;
    });
}

describe('actions/CompanyCards card rename', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('writes only to WORKSPACE_CARDS_LIST — not to any NVP key', () => {
        // Given a card manager who renames a card
        // When the rename action is dispatched
        updateCompanyCardName(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, 'New name', BANK, 'Old name');

        // Then the optimistic write targets only the WORKSPACE_CARDS_LIST key for this workspace and feed
        const optimisticKeys = getOptimisticKeys();
        expect(optimisticKeys).toHaveLength(1);
        expect(optimisticKeys.at(0)).toBe(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`);

        // And neither personal nor shared NVP custom name keys are touched
        expect(optimisticKeys).not.toContain(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
        expect(optimisticKeys.some((key) => key.startsWith(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER))).toBe(false);
    });

    it('restores cardTitle to the previous value when the rename fails', () => {
        // Given a card whose current title is "Old name"
        // When the rename action is dispatched and the request fails
        updateCompanyCardName(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, 'New name', BANK, 'Old name');

        // Then the failure data writes cardTitle back to "Old name" so the card object reverts
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {
                            [CARD_ID]: expect.objectContaining({
                                nameValuePairs: expect.objectContaining({cardTitle: 'Old name'}),
                            }),
                        },
                    }),
                ],
            }),
        );
    });

    it('nulls out cardTitle in failure data when the card had no previous title', () => {
        // Given a card that was never renamed (no previous cardTitle)
        // When the rename action is dispatched and the request fails
        updateCompanyCardName(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, 'New name', BANK, undefined);

        // Then the failure data nulls cardTitle so Onyx removes the optimistic value
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {
                            [CARD_ID]: expect.objectContaining({
                                nameValuePairs: expect.objectContaining({cardTitle: null}),
                            }),
                        },
                    }),
                ],
            }),
        );
    });
});
