import {renderHook} from '@testing-library/react-native';

import useGetNewPersonalCard from '@pages/settings/Wallet/PersonalCards/useGetNewPersonalCard';

import type {CardList} from '@src/types/onyx';

import createRandomCard from '../utils/collections/card';

let mockCardList: CardList | undefined = {};

jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockCardList]));

describe('useGetNewPersonalCard', () => {
    beforeEach(() => {
        mockCardList = {};
    });

    it('detects cards added after an empty card list loads', () => {
        // Given the user has removed every personal card before starting another connection
        const {result, rerender} = renderHook(() => useGetNewPersonalCard());
        const card = createRandomCard(1, {fundID: undefined});

        // When the connection adds a card to the previously empty list
        mockCardList = {[card.cardID]: card};
        rerender(undefined);

        // Then the connection flow can advance to its success screen without a reload
        expect(result.current).toBe(card);
    });

    it('uses cards loaded from storage as the initial baseline', () => {
        // Given Onyx is still loading cards that existed before the connection started
        const existingCard = createRandomCard(1, {fundID: undefined});
        mockCardList = undefined;
        const {result, rerender} = renderHook(() => useGetNewPersonalCard());

        // When the existing card list finishes loading
        mockCardList = {[existingCard.cardID]: existingCard};
        rerender(undefined);

        // Then an existing card is not mistaken for a newly connected card
        expect(result.current).toBeNull();
    });
});
