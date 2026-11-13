import {
    clearCompanyCardErrorField,
    deleteWorkspaceCompanyCardFeed,
    resetFailedWorkspaceCompanyCardUnassignment,
    setCompanyCardExportAccount,
    unassignWorkspaceCompanyCard,
    updateCompanyCardName,
} from '@libs/actions/CompanyCards';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';

jest.mock('@libs/API');

const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 1234567;
const CARD_ID = '99';
const BANK = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
const POLICY_ID = 'policy123';

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

describe('actions/CompanyCards', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── updateCompanyCardName ───────────────────────────────────────────────────

    describe('updateCompanyCardName', () => {
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

    // ─── unassignWorkspaceCompanyCard ────────────────────────────────────────────

    describe('unassignWorkspaceCompanyCard', () => {
        const card = createMock<Card>({
            cardID: Number(CARD_ID),
            bank: BANK,
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            domainName: 'test.exfy',
            fraud: 'none',
            lastUpdated: '',
            nameValuePairs: {},
        });
        const feedKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`;

        it('marks the card as DELETE on both WORKSPACE_CARDS_LIST and CARD_LIST in optimistic data', () => {
            // Given an admin who unassigns a card
            // When the unassign action is dispatched
            unassignWorkspaceCompanyCard(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card);

            // Then the optimistic update marks the card pending-delete on the feed key
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UNASSIGN_CARD,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: feedKey,
                            value: {[CARD_ID]: expect.objectContaining({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})},
                        }),
                        expect.objectContaining({
                            key: ONYXKEYS.CARD_LIST,
                            value: {[CARD_ID]: expect.objectContaining({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})},
                        }),
                    ]),
                }),
            );
        });

        it('restores the card with an error on both keys when the unassign fails', () => {
            // Given an admin who unassigns a card and the request fails
            // When the unassign action is dispatched
            unassignWorkspaceCompanyCard(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card);

            // Then failure data restores the card and surfaces the unassign error on both Onyx keys
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.UNASSIGN_CARD,
                expect.anything(),
                expect.objectContaining({
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: feedKey,
                            value: {[CARD_ID]: expect.objectContaining({pendingAction: null})},
                        }),
                        expect.objectContaining({
                            key: ONYXKEYS.CARD_LIST,
                            value: {[CARD_ID]: expect.objectContaining({pendingAction: null})},
                        }),
                    ]),
                }),
            );
        });
    });

    // ─── resetFailedWorkspaceCompanyCardUnassignment ─────────────────────────────

    describe('resetFailedWorkspaceCompanyCardUnassignment', () => {
        it('does nothing when bankName is absent', () => {
            // Given an unassignment that failed but bankName is unavailable
            const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

            // When attempting to reset the error
            resetFailedWorkspaceCompanyCardUnassignment(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, undefined, Number(CARD_ID));

            // Then no Onyx keys are updated
            expect(onyxMergeSpy).not.toHaveBeenCalled();
        });

        it('clears errors on both WORKSPACE_CARDS_LIST and CARD_LIST when both are present', () => {
            // Given a card whose unassignment failed and left an error
            const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

            // When the error is dismissed
            resetFailedWorkspaceCompanyCardUnassignment(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, Number(CARD_ID));

            // Then errors are nulled on the feed key
            expect(onyxMergeSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`, {
                [CARD_ID]: {errors: null},
            });

            // And errors are nulled on the global card list
            expect(onyxMergeSpy).toHaveBeenCalledWith(ONYXKEYS.CARD_LIST, {
                [CARD_ID]: {errors: null},
            });
        });
    });

    // ─── setCompanyCardExportAccount ─────────────────────────────────────────────

    describe('setCompanyCardExportAccount', () => {
        const ACCOUNT_KEY = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT;
        const feedKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`;

        it('writes the account value to nameValuePairs when a non-empty account is provided', () => {
            // Given a card manager who sets an export account
            // When the export account is set to a specific account
            setCompanyCardExportAccount(POLICY_ID, DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, ACCOUNT_KEY, 'qbo-cc-1', BANK);

            // Then the optimistic update writes the account name to nameValuePairs
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_CARD_EXPORT_ACCOUNT,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: [
                        expect.objectContaining({
                            key: feedKey,
                            value: {
                                [CARD_ID]: expect.objectContaining({
                                    nameValuePairs: expect.objectContaining({[ACCOUNT_KEY]: 'qbo-cc-1'}),
                                }),
                            },
                        }),
                    ],
                }),
            );
        });

        it('writes null to nameValuePairs when an empty string is provided to clear the account', () => {
            // Given a card whose export account should be cleared
            // When an empty string is passed as the new account
            setCompanyCardExportAccount(POLICY_ID, DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, ACCOUNT_KEY, '', BANK);

            // Then the optimistic update writes null to remove the custom export account
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_CARD_EXPORT_ACCOUNT,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: [
                        expect.objectContaining({
                            key: feedKey,
                            value: {
                                [CARD_ID]: expect.objectContaining({
                                    nameValuePairs: expect.objectContaining({[ACCOUNT_KEY]: null}),
                                }),
                            },
                        }),
                    ],
                }),
            );
        });
    });

    // ─── clearCompanyCardErrorField ───────────────────────────────────────────────

    describe('clearCompanyCardErrorField', () => {
        it('clears the error at the card root level when isRootLevel is true', () => {
            // Given a card with a root-level error field (e.g. scrapeMinDate)
            const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

            // When the error is cleared at root level
            clearCompanyCardErrorField(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, BANK, 'scrapeMinDate', true);

            // Then only the root errorFields entry is cleared — not nameValuePairs
            expect(onyxMergeSpy).toHaveBeenCalledTimes(1);
            expect(onyxMergeSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`, {
                [CARD_ID]: {errorFields: {scrapeMinDate: null}},
            });
        });

        it('clears the error inside nameValuePairs on both keys when isRootLevel is false', () => {
            // Given a card with a nameValuePairs-level error field (e.g. cardTitle)
            const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

            // When the error is cleared (default: not root level)
            clearCompanyCardErrorField(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, CARD_ID, BANK, 'cardTitle');

            // Then the nameValuePairs error is cleared on the feed key
            expect(onyxMergeSpy).toHaveBeenCalledWith(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`, {
                [CARD_ID]: {nameValuePairs: {errorFields: {cardTitle: null}}},
            });

            // And the nameValuePairs error is also cleared on the global card list
            expect(onyxMergeSpy).toHaveBeenCalledWith(ONYXKEYS.CARD_LIST, {
                [CARD_ID]: {nameValuePairs: {errorFields: {cardTitle: null}}},
            });
        });
    });

    // ─── deleteWorkspaceCompanyCardFeed ──────────────────────────────────────────

    describe('deleteWorkspaceCompanyCardFeed', () => {
        const FEED_TO_OPEN = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;
        const feedKey = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`;

        it('includes the target feed in the LAST_SELECTED_FEED optimistic update when feedToOpen is provided', () => {
            // Given an admin who deletes a feed and wants to switch to another feed
            // When the delete is dispatched with feedToOpen
            deleteWorkspaceCompanyCardFeed(POLICY_ID, DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, [CARD_ID], FEED_TO_OPEN);

            // Then the optimistic data includes a LAST_SELECTED_FEED update pointing to the target feed
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`,
                            value: FEED_TO_OPEN,
                        }),
                    ]),
                }),
            );
        });

        it('nulls the LAST_SELECTED_FEED when no feedToOpen is provided', () => {
            // Given an admin who deletes the last feed with no other feed to switch to
            // When the delete is dispatched without feedToOpen
            deleteWorkspaceCompanyCardFeed(POLICY_ID, DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, [CARD_ID]);

            // Then LAST_SELECTED_FEED is set to null so the selector clears the selection
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${POLICY_ID}`,
                            value: null,
                        }),
                    ]),
                }),
            );
        });

        it('uses SET (not MERGE) in success data to fully clear the WORKSPACE_CARDS_LIST key', () => {
            // Given an admin who successfully deletes a feed
            // When the delete succeeds
            deleteWorkspaceCompanyCardFeed(POLICY_ID, DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, [CARD_ID]);

            // Then success data uses SET so all cards in the feed are removed atomically
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED,
                expect.anything(),
                expect.objectContaining({
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            onyxMethod: Onyx.METHOD.SET,
                            key: feedKey,
                            value: null,
                        }),
                    ]),
                }),
            );
        });
    });
});
