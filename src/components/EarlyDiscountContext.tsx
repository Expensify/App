import type {ReactElement} from 'react';
import React, {createContext, useCallback, useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type EarlyDiscountContextProps = {
    /** Whether the discount banner is dismissed */
    isDiscountBannerDismissed: boolean;

    /** Function to dismiss the discount banner */
    setIsDiscountBannerDismissed: () => void;
};

const EarlyDiscountContext = createContext<EarlyDiscountContextProps>({
    isDiscountBannerDismissed: false,
    setIsDiscountBannerDismissed: () => {},
});

function EarlyDiscountProvider({children}: ChildrenProps): ReactElement {
    const [isDiscountBannerDismissed, setIsDiscountBannerDismissedState] = useState(false);

    const setIsDiscountBannerDismissed = useCallback(() => {
        setIsDiscountBannerDismissedState(true);
    }, []);

    const contextValue = useMemo(
        () => ({
            isDiscountBannerDismissed,
            setIsDiscountBannerDismissed,
        }),
        [isDiscountBannerDismissed, setIsDiscountBannerDismissed],
    );

    return <EarlyDiscountContext.Provider value={contextValue}>{children}</EarlyDiscountContext.Provider>;
}

export type {EarlyDiscountContextProps};
export {EarlyDiscountProvider, EarlyDiscountContext};
