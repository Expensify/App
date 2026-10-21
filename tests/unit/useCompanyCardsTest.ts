import {act, renderHook} from '@testing-library/react-native';

import useCompanyCards from '@hooks/useCompanyCards';

import CONST from '@src/CONST';
import initOnyxDerivedValues from '@src/libs/actions/OnyxDerived';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = '1';
const DOMAIN_ID = 22740664;
const FEED = 'ccupload1';
const FEED_WITH_DOMAIN_ID = `${FEED}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${DOMAIN_ID}` as const;
const CARDS_LIST_KEY = `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DOMAIN_ID}_${FEED}` as const;

const CARD_NAME = '411111XXXXXX1111';
const LOWERCASED_CARD_NAME = CARD_NAME.toLowerCase();
const OTHER_CARD_NAME = '555555XXXXXX4444';
const LOWERCASED_OTHER_CARD_NAME = OTHER_CARD_NAME.toLowerCase();
const ENCRYPTED_CARD_NUMBER = 'encrypted-1';
const OTHER_ENCRYPTED_CARD_NUMBER = 'encrypted-2';
const CARD_ID = '1496736153473131';
const OTHER_CARD_ID = '1496736153473132';

function buildAssignedCard(card: Pick<Card, 'cardName' | 'encryptedCardNumber' | 'lastFourPAN'>): Card {
    return {
        cardID: Number(CARD_ID),
        bank: FEED,
        domainName: 'expensify.com',
        lastUpdated: '',
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        ...card,
    };
}

/** Seeds the feed's card list and returns the entries `useCompanyCards` builds from it. */
async function getCompanyCardEntries(cardList: Record<string, string>, assignedCards: Record<string, Card>) {
    await act(async () => {
        await Onyx.set(CARDS_LIST_KEY, {
            [CONST.COMPANY_CARD.CARD_LIST]: cardList,
            ...assignedCards,
        });
        await waitForBatchedUpdatesWithAct();
    });

    const {result} = renderHook(() => useCompanyCards({policyID: POLICY_ID, feedName: FEED_WITH_DOMAIN_ID}));
    await waitForBatchedUpdatesWithAct();

    return result.current.companyCardEntries ?? [];
}

describe('useCompanyCards', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('companyCardEntries', () => {
        it('lists every card of an untouched feed as unassigned', async () => {
            const entries = await getCompanyCardEntries({[CARD_NAME]: ENCRYPTED_CARD_NUMBER, [OTHER_CARD_NAME]: OTHER_ENCRYPTED_CARD_NUMBER}, {});

            expect(entries).toHaveLength(2);
            expect(entries.every((entry) => !entry.isAssigned)).toBe(true);
        });

        it('shows an assigned card once when the record is linked by its encryptedCardNumber', async () => {
            const entries = await getCompanyCardEntries(
                {[CARD_NAME]: ENCRYPTED_CARD_NUMBER},
                {[CARD_ID]: buildAssignedCard({cardName: 'A renamed card', encryptedCardNumber: ENCRYPTED_CARD_NUMBER, lastFourPAN: '1111'})},
            );

            expect(entries).toHaveLength(1);
            expect(entries.at(0)?.isAssigned).toBe(true);
        });

        it('shows an assigned card once when only the lastFourPAN links it to the feed', async () => {
            const entries = await getCompanyCardEntries(
                {[CARD_NAME]: ENCRYPTED_CARD_NUMBER},
                {[CARD_ID]: buildAssignedCard({cardName: 'A renamed card', encryptedCardNumber: '', lastFourPAN: '1111'})},
            );

            expect(entries).toHaveLength(1);
            expect(entries.at(0)?.isAssigned).toBe(true);
        });

        // Regression test for https://github.com/Expensify/App/issues/97138
        it('shows an assigned card once when its name differs from the feed entry only by casing', async () => {
            const entries = await getCompanyCardEntries(
                {[CARD_NAME]: ENCRYPTED_CARD_NUMBER},
                {[CARD_ID]: buildAssignedCard({cardName: LOWERCASED_CARD_NAME, encryptedCardNumber: '', lastFourPAN: ''})},
            );

            expect(entries).toHaveLength(1);
            expect(entries.at(0)?.isAssigned).toBe(true);
        });

        it('keeps both assigned cards when neither record carries an encryptedCardNumber', async () => {
            const entries = await getCompanyCardEntries(
                {[CARD_NAME]: ENCRYPTED_CARD_NUMBER, [OTHER_CARD_NAME]: OTHER_ENCRYPTED_CARD_NUMBER},
                {
                    [CARD_ID]: buildAssignedCard({cardName: LOWERCASED_CARD_NAME, encryptedCardNumber: '', lastFourPAN: ''}),
                    [OTHER_CARD_ID]: buildAssignedCard({cardName: LOWERCASED_OTHER_CARD_NAME, encryptedCardNumber: '', lastFourPAN: ''}),
                },
            );

            expect(entries).toHaveLength(2);
            expect(entries.every((entry) => entry.isAssigned)).toBe(true);
        });

        it('collapses two assigned records that resolve to the same feed entry', async () => {
            const entries = await getCompanyCardEntries(
                {[CARD_NAME]: ENCRYPTED_CARD_NUMBER},
                {
                    [CARD_ID]: buildAssignedCard({cardName: CARD_NAME, encryptedCardNumber: ENCRYPTED_CARD_NUMBER, lastFourPAN: '1111'}),
                    [OTHER_CARD_ID]: buildAssignedCard({cardName: CARD_NAME, encryptedCardNumber: '', lastFourPAN: ''}),
                },
            );

            expect(entries).toHaveLength(1);
            expect(entries.at(0)?.isAssigned).toBe(true);
        });

        it('still offers the other cards of the feed while one of them is assigned', async () => {
            const entries = await getCompanyCardEntries(
                {[CARD_NAME]: ENCRYPTED_CARD_NUMBER, [OTHER_CARD_NAME]: OTHER_ENCRYPTED_CARD_NUMBER},
                {[CARD_ID]: buildAssignedCard({cardName: LOWERCASED_CARD_NAME, encryptedCardNumber: '', lastFourPAN: ''})},
            );

            expect(entries).toHaveLength(2);
            expect(entries.filter((entry) => entry.isAssigned)).toHaveLength(1);
            expect(entries.find((entry) => !entry.isAssigned)?.cardName).toBe(OTHER_CARD_NAME);
        });
    });
});
