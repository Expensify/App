import React, {createContext, useContext, useState} from 'react';
import {InteractionManager} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import {dismissProductTraining} from '@libs/actions/Welcome';
import {isMobile} from '@libs/Browser';
import useScanRouteParams from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams';
import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const {iouType} = useScanRouteParams();

    const [isMultiScanEnabled, setIsMultiScanEnabled] = useState(false);
    const [showEducationalPopup, setShowEducationalPopup] = useState(false);
    const [dismissedProductTrainingResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const canUseMultiScan = iouType !== CONST.IOU.TYPE.SPLIT;

    function toggleMultiScan() {
        if (!dismissedProductTrainingResult?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]) {
            setShowEducationalPopup(true);
        }
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        removeDraftTransactionsByIDs(draftTransactionIDs, true);
        setIsMultiScanEnabled((prev) => !prev);
    }

    function dismissEducationalPopup() {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- InteractionManager is standard RN API for deferred work
        InteractionManager.runAfterInteractions(() => {
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

/**
 * Platform gate — renders MultiScanProvider on mobile (web + native), passes children through on desktop.
 * Multi-scan is a camera-based mobile interaction; desktop uses file picker with shouldAcceptMultipleFiles instead.
 */
function MultiScanGate({children}: MultiScanProviderProps) {
    if (isMobile()) {
        return <MultiScanProvider>{children}</MultiScanProvider>;
    }
    return children;
}

export {MultiScanGate, MultiScanProvider, useMultiScanState, useMultiScanActions};
export type {MultiScanState, MultiScanActions};
