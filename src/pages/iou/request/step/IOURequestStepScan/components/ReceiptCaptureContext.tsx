/**
 * Lets the scan camera tell the create-expense page that a receipt is being processed or shown, so the page can hide its
 * Manual/Scan tabs while the captured receipt fills the screen. Outside a provider it does nothing.
 */
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {createContext, useContext, useState} from 'react';

type ReceiptCaptureState = {
    isReceiptCaptureShown: boolean;
};

type ReceiptCaptureActions = {
    setIsReceiptCaptureShown: (isShown: boolean) => void;
};

const defaultState: ReceiptCaptureState = {isReceiptCaptureShown: false};

const defaultActions: ReceiptCaptureActions = {setIsReceiptCaptureShown: () => {}};

const ReceiptCaptureStateContext = createContext<ReceiptCaptureState>(defaultState);
const ReceiptCaptureActionsContext = createContext<ReceiptCaptureActions>(defaultActions);

function useReceiptCaptureState(): ReceiptCaptureState {
    return useContext(ReceiptCaptureStateContext);
}

function useReceiptCaptureActions(): ReceiptCaptureActions {
    return useContext(ReceiptCaptureActionsContext);
}

function ReceiptCaptureProvider({children}: ChildrenProps) {
    const [isReceiptCaptureShown, setIsReceiptCaptureShown] = useState(false);

    return (
        <ReceiptCaptureActionsContext.Provider value={{setIsReceiptCaptureShown}}>
            <ReceiptCaptureStateContext.Provider value={{isReceiptCaptureShown}}>{children}</ReceiptCaptureStateContext.Provider>
        </ReceiptCaptureActionsContext.Provider>
    );
}

export {ReceiptCaptureProvider, useReceiptCaptureState, useReceiptCaptureActions};
