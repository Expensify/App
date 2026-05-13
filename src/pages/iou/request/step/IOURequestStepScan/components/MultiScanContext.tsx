import React, {createContext, useContext, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import {dismissProductTraining} from '@libs/actions/Welcome';
import useScanRouteParams from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams';
import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';

type MultiScanState = {
    isMultiScanEnabled: boolean;
    canUseMultiScan: boolean;
    showEducationalPopup: boolean;
};

type MultiScanActions = {
    toggleMultiScan: () => void;
    dismissEducationalPopup: () => void;
};

const defaultState: MultiScanState = {
    isMultiScanEnabled: false,
    canUseMultiScan: false,
    showEducationalPopup: false,
};

const defaultActions: MultiScanActions = {
    toggleMultiScan: () => {},
    dismissEducationalPopup: () => {},
};

const MultiScanStateContext = createContext<MultiScanState>(defaultState);
const MultiScanActionsContext = createContext<MultiScanActions>(defaultActions);

function useMultiScanState(): MultiScanState {
    return useContext(MultiScanStateContext);
}

function useMultiScanActions(): MultiScanActions {
    return useContext(MultiScanActionsContext);
}

type MultiScanProviderProps = {
    children: React.ReactNode;
};

function MultiScanProvider({children}: MultiScanProviderProps) {
    const {iouType, routeName} = useScanRouteParams();

    const [isMultiScanEnabled, setIsMultiScanEnabled] = useState(false);
    const [showEducationalPopup, setShowEducationalPopup] = useState(false);
    const [dismissedProductTrainingResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const isStartingScan = routeName === SCREENS.MONEY_REQUEST.CREATE;
    const canUseMultiScan = isStartingScan && iouType !== CONST.IOU.TYPE.SPLIT;

    function toggleMultiScan() {
        if (!dismissedProductTrainingResult?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]) {
            setShowEducationalPopup(true);
        }
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        removeDraftTransactionsByIDs(draftTransactionIDs, true);
        setIsMultiScanEnabled((prev) => !prev);
    }

    function dismissEducationalPopup() {
        // Defer dismissal to avoid updating state during the modal close animation
        requestAnimationFrame(() => {
            dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            setShowEducationalPopup(false);
        });
    }

    const stateValue: MultiScanState = {
        isMultiScanEnabled,
        canUseMultiScan,
        showEducationalPopup,
    };

    const actionsValue: MultiScanActions = {
        toggleMultiScan,
        dismissEducationalPopup,
    };

    return (
        <MultiScanActionsContext.Provider value={actionsValue}>
            <MultiScanStateContext.Provider value={stateValue}>{children}</MultiScanStateContext.Provider>
        </MultiScanActionsContext.Provider>
    );
}

export {MultiScanProvider, useMultiScanState, useMultiScanActions};
export type {MultiScanState, MultiScanActions};
