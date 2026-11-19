import {updateAssignedCardName} from '@libs/actions/Card';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

const CARD_ID = '999';

describe('actions/Card updateAssignedCardName', () => {
    let apiWriteSpy: jest.SpyInstance;

    beforeEach(() => {
        apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('writes the new cardTitle optimistically and rolls it back on failure', () => {
        // Given a personal card being renamed from 'Old Name' to 'New Name'

        // When the card is renamed
        updateAssignedCardName(CARD_ID, 'New Name', 'Old Name');

        // Then the new title is set optimistically in CARD_LIST
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.objectContaining({cardName: 'New Name'}),
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: ONYXKEYS.CARD_LIST,
                        value: {
                            [CARD_ID]: expect.objectContaining({
                                nameValuePairs: expect.objectContaining({cardTitle: 'New Name'}),
                            }),
                        },
                    }),
                ]),
            }),
        );

        // And the old title is restored in CARD_LIST when the request fails
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.anything(),
            expect.objectContaining({
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: ONYXKEYS.CARD_LIST,
                        value: {
                            [CARD_ID]: expect.objectContaining({
                                nameValuePairs: expect.objectContaining({cardTitle: 'Old Name'}),
                            }),
                        },
                    }),
                ]),
            }),
        );
    });

    it('does not write to the legacy custom card names map on rename or rollback', () => {
        // Given a card being renamed

        // When the rename action is called
        updateAssignedCardName(CARD_ID, 'New Name', 'Old Name');

        // Then neither the optimistic nor the failure data touch the legacy NVP map
        expect(apiWriteSpy).not.toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                optimisticData: expect.arrayContaining([expect.objectContaining({key: ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES})]),
            }),
        );
        expect(apiWriteSpy).not.toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                failureData: expect.arrayContaining([expect.objectContaining({key: ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES})]),
            }),
        );
    });

    it('clears the pending action on the cardTitle field regardless of success or failure', () => {
        // Given a card being renamed

        // When the rename action is called
        updateAssignedCardName(CARD_ID, 'New Name', 'Old Name');

        // Then the pending state is cleared in the finallyData so the spinner stops either way
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME,
            expect.anything(),
            expect.objectContaining({
                finallyData: expect.arrayContaining([
                    expect.objectContaining({
                        key: ONYXKEYS.CARD_LIST,
                        value: {
                            [CARD_ID]: expect.objectContaining({
                                nameValuePairs: expect.objectContaining({pendingFields: {cardTitle: null}}),
                            }),
                        },
                    }),
                ]),
            }),
        );
    });
});
