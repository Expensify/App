/**
 * While multi-scan is on, the Scan step shows the receipts captured so far, so closing the RHP or switching tabs asks first.
 * Without multi-scan, the Scan step only shows the camera, so it doesn't ask.
 */
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useTransactionDraftReceipts from '@hooks/useTransactionDraftReceipts';

import {isFlowDiscardPromptSuppressed} from '@libs/Navigation/helpers/discardPromptState';

import noop from 'lodash/noop';
import React from 'react';

import {useMultiScanState} from './MultiScanContext';

function CapturedReceiptsDiscardGuard() {
    const receipts = useTransactionDraftReceipts();
    const hasCapturedReceipts = receipts.some((receipt) => !!receipt.source);

    useDiscardChangesConfirmation({
        // A submit that skips Confirmation closes the flow on purpose and mutes the prompt first
        getHasUnsavedChanges: () => hasCapturedReceipts && !isFlowDiscardPromptSuppressed(),
        // Switching tabs already clears the receipts, so Discard has nothing extra to do. Without a handler, the tab switch doesn't ask at all.
        onTabSwitchDiscard: noop,
    });

    return null;
}

function MultiScanDiscardGuard() {
    const {isMultiScanEnabled} = useMultiScanState();
    return isMultiScanEnabled ? <CapturedReceiptsDiscardGuard /> : null;
}

export default MultiScanDiscardGuard;
