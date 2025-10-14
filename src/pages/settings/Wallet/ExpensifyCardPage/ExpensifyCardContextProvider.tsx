import type {PropsWithChildren} from 'react';
import React, {createContext, useMemo, useState} from 'react';
import type {ExpensifyCardDetails} from '@src/types/onyx/Card';

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
    const [cardsDetails, setCardsDetails] = useState<Record<number, ExpensifyCardDetails | null>>({});
    const [isCardDetailsLoading, setIsCardDetailsLoading] = useState<Record<number, boolean>>({});
    const [cardsDetailsErrors, setCardsDetailsErrors] = useState<Record<number, string>>({});

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
