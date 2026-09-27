import {setCardPreferredPolicy} from '@libs/actions/Card';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

const DOMAIN_OR_WORKSPACE_ACCOUNT_ID = 12345;
const BANK = CONST.EXPENSIFY_CARD.BANK;
const CARD_ID = 1;
const CARDHOLDER_ACCOUNT_ID = 222;
const CURRENT_USER_ACCOUNT_ID = 111;

/** A card belonging to someone other than the viewer, which is the usual case for a card admin. */
const card = createMock<Card>({cardID: CARD_ID, accountID: CARDHOLDER_ACCOUNT_ID});

/** The same card, but the viewer is the cardholder, so their own `cardList` copy needs the update too. */
const ownCard = createMock<Card>({cardID: CARD_ID, accountID: CURRENT_USER_ACCOUNT_ID});

describe('actions/Card setCardPreferredPolicy', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockWrite.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('sends the raw preferredPolicyID and optimistically stores it verbatim when pinning a specific workspace', () => {
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card, 'newPolicyID', undefined, CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            {cardID: CARD_ID, preferredPolicyID: 'newPolicyID'},
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`,
                        value: {[CARD_ID]: {nameValuePairs: expect.objectContaining({preferredPolicy: 'newPolicyID'})}},
                    }),
                ],
            }),
        );
    });

    it('stores an explicit None pin as the literal "0" string, not null', () => {
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card, CONST.CARD_PREFERRED_POLICY.NONE, undefined, CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            {cardID: CARD_ID, preferredPolicyID: CONST.CARD_PREFERRED_POLICY.NONE},
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: {[CARD_ID]: {nameValuePairs: expect.objectContaining({preferredPolicy: CONST.CARD_PREFERRED_POLICY.NONE})}},
                    }),
                ],
            }),
        );
    });

    it('optimistically deletes the preferredPolicy key (null, not empty string) when clearing to the employee default', () => {
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card, CONST.CARD_PREFERRED_POLICY.EMPLOYEE_DEFAULT, 'oldPolicyID', CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            {cardID: CARD_ID, preferredPolicyID: ''},
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: {[CARD_ID]: {nameValuePairs: expect.objectContaining({preferredPolicy: null})}},
                    }),
                ],
            }),
        );
    });

    it('rolls back to the previous value on failure and clears pendingFields', () => {
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card, 'newPolicyID', 'oldPolicyID', CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {
                            [CARD_ID]: {
                                nameValuePairs: expect.objectContaining({
                                    preferredPolicy: 'oldPolicyID',
                                    pendingFields: {preferredPolicy: null},
                                }),
                            },
                        },
                    }),
                ],
            }),
        );
    });

    it('rolls back to null (not undefined) when there was no previous value', () => {
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card, 'newPolicyID', undefined, CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            expect.anything(),
            expect.objectContaining({
                failureData: [
                    expect.objectContaining({
                        value: {[CARD_ID]: {nameValuePairs: expect.objectContaining({preferredPolicy: null})}},
                    }),
                ],
            }),
        );
    });

    it('clears pendingFields on success without re-asserting the value', () => {
        // Given the write command returns no onyxData — the authoritative value arrives via the server-pushed
        // Onyx update — so success only has to retire the pending state
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card, 'newPolicyID', undefined, CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            expect.anything(),
            expect.objectContaining({
                successData: [
                    expect.objectContaining({
                        value: {[CARD_ID]: {nameValuePairs: {pendingFields: {preferredPolicy: null}}}},
                    }),
                ],
            }),
        );
    });

    it('only writes to WORKSPACE_CARDS_LIST when the cardholder is not the current user', () => {
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, card, 'newPolicyID', undefined, CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            expect.anything(),
            expect.objectContaining({
                optimisticData: [expect.objectContaining({key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`})],
            }),
        );
    });

    it('also mirrors the write into CARD_LIST when the cardholder is the current user', () => {
        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, BANK, ownCard, 'newPolicyID', undefined, CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            expect.anything(),
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${BANK}`}),
                    expect.objectContaining({key: ONYXKEYS.CARD_LIST}),
                ],
            }),
        );
    });

    it('builds the BYOC WORKSPACE_CARDS_LIST key from the domain ID and the company card feed name', () => {
        const companyCardBank = 'oauth.chase.com';

        setCardPreferredPolicy(DOMAIN_OR_WORKSPACE_ACCOUNT_ID, companyCardBank, card, 'newPolicyID', undefined, CURRENT_USER_ACCOUNT_ID);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.SET_CARD_PREFERRED_POLICY,
            expect.anything(),
            expect.objectContaining({
                optimisticData: [expect.objectContaining({key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_OR_WORKSPACE_ACCOUNT_ID}_${companyCardBank}`})],
            }),
        );
    });
});
