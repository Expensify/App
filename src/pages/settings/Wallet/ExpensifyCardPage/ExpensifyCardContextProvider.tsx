import {filterPersonalCards} from '@selectors/Card';
import type {PropsWithChildren} from 'react';
import React, {createContext, useEffect, useMemo, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, ExpensifyCardDetails} from '@src/types/onyx/Card';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type ExpensifyCardContextProviderProps = {
    cardsDetails: Record<number, ExpensifyCardDetails | null>;
    setCardsDetails: React.Dispatch<React.SetStateAction<Record<number, ExpensifyCardDetails | null>>>;
    isCardDetailsLoading: Record<number, boolean>;
    setIsCardDetailsLoading: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    cardsDetailsErrors: Record<number, string>;
    setCardsDetailsErrors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
};

const ExpensifyCardContext = createContext<ExpensifyCardContextProviderProps>({
    cardsDetails: {},
    setCardsDetails: () => {},
    isCardDetailsLoading: {},
    setIsCardDetailsLoading: () => {},
    cardsDetailsErrors: {},
    setCardsDetailsErrors: () => {},
});

/**
 * Context to display revealed expensify card data and pass it between screens.
 */
function ExpensifyCardContextProvider({children}: PropsWithChildren) {
    const [cardList = getEmptyObject<CardList>()] = useOnyx(ONYXKEYS.CARD_LIST, {
        selector: filterPersonalCards,
        canBeMissing: true,
    });
    const [cardsDetails, setCardsDetails] = useState<Record<number, ExpensifyCardDetails | null>>({});
    const [isCardDetailsLoading, setIsCardDetailsLoading] = useState<Record<number, boolean>>({});
    const [cardsDetailsErrors, setCardsDetailsErrors] = useState<Record<number, string>>({});

    const cardListErrors = useMemo(() => {
        if (!cardList) {
            return {};
        }
        const errors: Record<string, Errors | undefined> = {};
        for (const cardID of Object.keys(cardList)) {
            errors[cardID] = cardList[cardID]?.errors;
        }
        return errors;
    }, [cardList]);

    // Update error state when error is cleared in Onyx DB
    useEffect(() => {
        setCardsDetailsErrors((prevErrors) => {
            const clearedErrors = {...prevErrors};
            for (const cardID of Object.keys(clearedErrors)) {
                if (cardListErrors[cardID] && Object.keys(cardListErrors[cardID]).length > 0) {
                    continue;
                }
                delete clearedErrors[Number(cardID)];
            }
            return clearedErrors;
        });
    }, [cardListErrors]);

    const value = useMemo(
        () => ({
            cardsDetails,
            setCardsDetails,
            isCardDetailsLoading,
            setIsCardDetailsLoading,
            cardsDetailsErrors,
            setCardsDetailsErrors,
        }),
        [cardsDetails, setCardsDetails, isCardDetailsLoading, setIsCardDetailsLoading, cardsDetailsErrors, setCardsDetailsErrors],
    );

    return <ExpensifyCardContext.Provider value={value}>{children}</ExpensifyCardContext.Provider>;
}

export default ExpensifyCardContextProvider;
export {ExpensifyCardContext};
