import useMultiScanEducationalModal from '@hooks/useMultiScanEducationalModal';
import useOnyx from '@hooks/useOnyx';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';

import {dismissProductTraining} from '@libs/actions/Welcome';

import useScanRouteParams from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanRouteParams';

import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';

import React, {createContext, useContext, useState} from 'react';

type MultiScanState = {
    isMultiScanEnabled: boolean;
    canUseMultiScan: boolean;
};

type MultiScanActions = {
    toggleMultiScan: () => void;
    disableMultiScan: () => void;
};

const defaultState: MultiScanState = {
    isMultiScanEnabled: false,
    canUseMultiScan: false,
};

const defaultActions: MultiScanActions = {
    toggleMultiScan: () => {},
    disableMultiScan: () => {},
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
    const showMultiScanEducationalModal = useMultiScanEducationalModal();
    const [dismissedProductTrainingResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const shouldSuppressPromotionalUI = useShouldSuppressPromotionalUI();

    const isStartingScan = routeName === SCREENS.MONEY_REQUEST.CREATE;
    const canUseMultiScan = isStartingScan && iouType !== CONST.IOU.TYPE.SPLIT;

    function toggleMultiScan() {
        if (!shouldSuppressPromotionalUI && !dismissedProductTrainingResult?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]) {
            showMultiScanEducationalModal()?.then(() => {
                dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            });
        }
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        removeDraftTransactionsByIDs(draftTransactionIDs, true);
        setIsMultiScanEnabled((prev) => !prev);
    }

    function disableMultiScan() {
        setIsMultiScanEnabled(false);
    }

    const stateValue: MultiScanState = {
        isMultiScanEnabled,
        canUseMultiScan,
    };

    const actionsValue: MultiScanActions = {
        toggleMultiScan,
        disableMultiScan,
    };

    return (
        <MultiScanActionsContext.Provider value={actionsValue}>
            <MultiScanStateContext.Provider value={stateValue}>{children}</MultiScanStateContext.Provider>
        </MultiScanActionsContext.Provider>
    );
}

export {MultiScanProvider, useMultiScanState, useMultiScanActions};
