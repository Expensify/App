import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

import {useEffect, useRef, useState} from 'react';

export default function useGetNewPersonalCard() {
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [newCard, setNewCard] = useState<Card | null>(null);
    const prevCardListRef = useRef<Record<string, Card>>({});
    const hasLoadedCardListRef = useRef(false);

    useEffect(() => {
        if (cardList === undefined) {
            return;
        }
        if (!hasLoadedCardListRef.current) {
            prevCardListRef.current = cardList;
            hasLoadedCardListRef.current = true;
            return;
        }

        // Find the first card that is either new or has a fresh import timestamp
        const latestChange = Object.values(cardList).find((card) => {
            const prev = prevCardListRef.current?.[card.cardID];
            return !prev || card.lastImportAttempt !== prev.lastImportAttempt;
        });

        if (latestChange) {
            setNewCard(latestChange);
        }

        prevCardListRef.current = cardList;
    }, [cardList]);

    return newCard;
}
