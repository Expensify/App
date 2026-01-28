import {filterPersonalCards} from '@selectors/Card';
import type {PropsWithChildren} from 'react';
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, ExpensifyCardDetails} from '@src/types/onyx/Card';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

type ExpensifyCardStateContextType = {
    cardsDetails: Record<number, ExpensifyCardDetails | null>;
    isCardDetailsLoading: Record<number, boolean>;
    cardsDetailsErrors: Record<number, string>;
};

type ExpensifyCardActionsContextType = {
    setCardsDetails: React.Dispatch<React.SetStateAction<Record<number, ExpensifyCardDetails | null>>>;
    setIsCardDetailsLoading: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    setCardsDetailsErrors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
};

const defaultActionsContext: ExpensifyCardActionsContextType = {
    setCardsDetails: () => {},
    setIsCardDetailsLoading: () => {},
    setCardsDetailsErrors: () => {},
};

const ExpensifyCardStateContext = createContext<ExpensifyCardStateContextType>({
    cardsDetails: {},
    isCardDetailsLoading: {},
    cardsDetailsErrors: {},
});

const ExpensifyCardActionsContext = createContext<ExpensifyCardActionsContextType>(defaultActionsContext);

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

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue: ExpensifyCardActionsContextType = {
        setCardsDetails,
        setIsCardDetailsLoading,
        setCardsDetailsErrors,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateContextValue: ExpensifyCardStateContextType = {
        cardsDetails,
        isCardDetailsLoading,
        cardsDetailsErrors,
    };

    return (
        <ExpensifyCardActionsContext.Provider value={actionsContextValue}>
            <ExpensifyCardStateContext.Provider value={stateContextValue}>{children}</ExpensifyCardStateContext.Provider>
        </ExpensifyCardActionsContext.Provider>
    );
}
function useExpensifyCardState(): ExpensifyCardStateContextType {
    return useContext(ExpensifyCardStateContext);
}

function useExpensifyCardActions(): ExpensifyCardActionsContextType {
    return useContext(ExpensifyCardActionsContext);
}

export default ExpensifyCardContextProvider;
export {useExpensifyCardState, useExpensifyCardActions};
