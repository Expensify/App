import {useEffect, useRef, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

export default function useGetNewPersonalCard() {
    const [cardList = getEmptyObject<CardList>()] = useOnyx(ONYXKEYS.CARD_LIST);
    const [newCard, setNewCard] = useState<Card | null>(null);
    const prevCardListRef = useRef<Record<string, Card>>({});

    useEffect(() => {
        if (!cardList) {
            return;
        }
        if (isEmptyObject(prevCardListRef.current) && cardList) {
            prevCardListRef.current = cardList;
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
