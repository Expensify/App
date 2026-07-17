import useYourSpendPatchData from '@hooks/useYourSpendPatchData';

import {EMPTY_YOUR_SPEND_PATCH_DATA} from '@libs/YourSpendPatchData';
import type {YourSpendPatchData} from '@libs/YourSpendPatchData';

import React, {createContext, useCallback, useContext, useEffect, useRef} from 'react';

// A getter (backed by a ref in the provider) rather than a plain value, so the many consumers that only read the
// patch data inside action handlers don't subscribe to the underlying Onyx data or re-render when it changes.
const YourSpendPatchDataContext = createContext<() => YourSpendPatchData>(() => EMPTY_YOUR_SPEND_PATCH_DATA);

type YourSpendPatchDataProviderProps = {
    children: React.ReactNode;
};

/** Subscribes to the Your spend patch data once for the whole app and exposes it as a ref-backed getter. */
function YourSpendPatchDataProvider({children}: YourSpendPatchDataProviderProps) {
    const yourSpendPatchData = useYourSpendPatchData();
    const yourSpendPatchDataRef = useRef(yourSpendPatchData);
    useEffect(() => {
        yourSpendPatchDataRef.current = yourSpendPatchData;
    });
    const getYourSpendPatchData = useCallback(() => yourSpendPatchDataRef.current, []);

    return <YourSpendPatchDataContext.Provider value={getYourSpendPatchData}>{children}</YourSpendPatchDataContext.Provider>;
}

/** Returns a stable getter for the Your spend patch data; call it inside action handlers. */
function useYourSpendPatchDataGetter() {
    return useContext(YourSpendPatchDataContext);
}

export {YourSpendPatchDataProvider, useYourSpendPatchDataGetter};
