import {updateCompanyCardName} from '@libs/actions/CompanyCards';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API', () => ({
    write: jest.fn(),
}));

const mockWrite = jest.mocked(API.write);

const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 12345678;
const CARD_ID = '99001';
const BANK_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
const WORKSPACE_CARDS_KEY = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK_NAME}` as const;

describe('updateCompanyCardName', () => {
    beforeEach(() => {
        mockWrite.mockClear();
    });

    it('restores cardTitle to the old value in failureData when a previous title existed', () => {
        // Given a card rename from an existing title to a new one.
        const oldCardTitle = 'Corporate Visa';
        const newCardTitle = 'Rejected New Name';

        // When the action is dispatched.
        updateCompanyCardName(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, newCardTitle, BANK_NAME, oldCardTitle);

        // Then failureData must restore nameValuePairs.cardTitle to the previous value so a failed
        // rename never leaves the rejected title visible in expense rows or group-by-card headings.
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.anything(),
            expect.objectContaining({
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: WORKSPACE_CARDS_KEY,
                        value: {
                            [CARD_ID]: {
                                nameValuePairs: expect.objectContaining({
                                    cardTitle: oldCardTitle,
                                }),
                            },
                        },
                    }),
                ]),
            }),
        );
    });

    it('sets cardTitle to null in failureData when the card had no previous title', () => {
        // Given a card rename where the card had no prior cardTitle (first-time rename).
        const newCardTitle = 'Brand New Name';

        // When the action is dispatched without an oldCardTitle.
        updateCompanyCardName(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, newCardTitle, BANK_NAME, undefined);

        // Then failureData must set cardTitle to null so Onyx clears the failed optimistic value.
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.anything(),
            expect.objectContaining({
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: WORKSPACE_CARDS_KEY,
                        value: {
                            [CARD_ID]: {
                                nameValuePairs: expect.objectContaining({
                                    cardTitle: null,
                                }),
                            },
                        },
                    }),
                ]),
            }),
        );
    });

    it('sets cardTitle optimistically to newCardTitle before the request resolves', () => {
        // Given any rename.
        const newCardTitle = 'Optimistic Name';

        // When the action is dispatched.
        updateCompanyCardName(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, newCardTitle, BANK_NAME, 'Old Name');

        // Then optimisticData must immediately apply the new title so the UI reflects it.
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.anything(),
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: WORKSPACE_CARDS_KEY,
                        value: {
                            [CARD_ID]: {
                                nameValuePairs: expect.objectContaining({
                                    cardTitle: newCardTitle,
                                }),
                            },
                        },
                    }),
                ]),
            }),
        );
    });
});
