import React, {useMemo} from 'react';
import CONST from '@src/CONST';
import type {ActiveModalContextProps, ActiveModalContextValue} from './types';

const ActiveModalContext = React.createContext<ActiveModalContextValue>({
    businessType: CONST.MODAL.BUSINESS_TYPE.DEFAULT,
});

function ActiveModalProvider({businessType, children}: ActiveModalContextProps) {
    const contextValue = useMemo(
        () => ({
            businessType,
        }),
        [businessType],
    );
    return <ActiveModalContext.Provider value={contextValue}>{children}</ActiveModalContext.Provider>;
}

export default ActiveModalProvider;
export {ActiveModalContext};
