/** Protects key-specific Onyx values and the factory's independent outside-provider marker. */
import {act, renderHook} from '@testing-library/react-native';

import createOnyxContext from '@components/createOnyxContext';

import ONYXKEYS from '@src/ONYXKEYS';

import type {PropsWithChildren} from 'react';
import type {OnyxValue, UseOnyxResult} from 'react-native-onyx';

import React, {useContext} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const [SessionProvider, SessionContext, useSession] = createOnyxContext(ONYXKEYS.SESSION);
const [BetasProvider, , useBetas] = createOnyxContext(ONYXKEYS.BETAS);
const [CardsProvider, CardsContext, useCards] = createOnyxContext(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);

function SessionWrapper({children}: PropsWithChildren) {
    return <SessionProvider>{children}</SessionProvider>;
}

function CardsWrapper({children}: PropsWithChildren) {
    return <CardsProvider>{children}</CardsProvider>;
}

describe('createOnyxContext', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        await act(async () => Onyx.clear());
    });

    it('exposes null outside a provider and throws the exact key-bearing hook error', () => {
        // Given no provider for the session key
        // When the raw context and the strict hook are read
        const {result} = renderHook(() => useContext(SessionContext));
        // Then only the strict hook rejects the outside-provider marker
        expect(result.current).toBeNull();
        expect(() => renderHook(useSession)).toThrow(`useOnyxContext must be used within a OnyxListItemProvider [key: ${ONYXKEYS.SESSION}]`);
        expect(SessionProvider.displayName).toBe('SessionProvider');
    });

    it('allows undefined inside the provider, then hydrates and updates the single-key value', async () => {
        // Given a provider whose value has not loaded
        const {result} = renderHook(useSession, {wrapper: SessionWrapper});
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
        // When the actual Onyx subscription receives a session and a subsequent update
        await act(async () => Onyx.set(ONYXKEYS.SESSION, {accountID: 42, email: 'first@example.com'}));
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toEqual({accountID: 42, email: 'first@example.com'});
        await act(async () => Onyx.merge(ONYXKEYS.SESSION, {email: 'second@example.com'}));
        await waitForBatchedUpdatesWithAct();
        // Then the hook keeps the producer's session fields through the update
        expect(result.current).toEqual({accountID: 42, email: 'second@example.com'});
        const session: UseOnyxResult<OnyxValue<typeof ONYXKEYS.SESSION>>[0] = result.current;
        expect(session?.accountID).toBe(42);
    });

    it('retains beta arrays and keyed workspace-card collections as distinct result types', async () => {
        // Given the two actual key categories supported by the factory
        const cards = {[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}1`]: {}};
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}1`, {});
        });
        // When providers read the values
        const betasHook = renderHook(useBetas, {wrapper: BetasProvider});
        const cardsHook = renderHook(useCards, {wrapper: CardsWrapper});
        await waitForBatchedUpdatesWithAct();
        const betas: UseOnyxResult<OnyxValue<typeof ONYXKEYS.BETAS>>[0] = betasHook.result.current;
        const cardCollection: UseOnyxResult<OnyxValue<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>>[0] = cardsHook.result.current;
        // Then arrays retain array methods while collections retain their keyed shape
        expect(betas?.includes('all')).toBe(false);
        expect(cardCollection).toEqual(cards);
    });
    it('preserves undefined collection members and the original collection reference', () => {
        // Given the declared collection result can include a member that has not loaded
        const cards: UseOnyxResult<OnyxValue<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>>[0] = {
            [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}1`]: {},
            [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}2`]: undefined,
        };
        function PartialCollectionWrapper({children}: PropsWithChildren) {
            return <CardsContext.Provider value={cards}>{children}</CardsContext.Provider>;
        }
        // When the generated hook reads that valid producer-shaped context value
        const {result} = renderHook(useCards, {wrapper: PartialCollectionWrapper});
        // Then consumers receive the same collection even when a member has not loaded
        expect(result.current).toBe(cards);
        expect(result.current).toHaveProperty(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}2`, undefined);
    });
});
