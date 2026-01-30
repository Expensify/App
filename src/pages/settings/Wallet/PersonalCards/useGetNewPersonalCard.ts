import {useEffect, useRef, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

export default function useGetNewPersonalCard() {
    const [cardList = getEmptyObject<CardList>()] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [newCard, setNewCard] = useState<Card | null>(null);
    const prevCardListRef = useRef<Record<string, Card>>({});

    useEffect(() => {
        const prevCardList = prevCardListRef.current;
        const prevIds = new Set(Object.keys(prevCardList));
        const currentIds = Object.keys(cardList);
        const newCardIds = currentIds.filter((id) => !prevIds.has(id));
        if (newCardIds.length > 0) {
            for (const id of newCardIds) {
                setNewCard(cardList[id]);
            }
        }

        prevCardListRef.current = cardList;
    }, [cardList]);

    return newCard;
}
