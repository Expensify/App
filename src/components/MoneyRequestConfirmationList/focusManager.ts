import CONST from '@src/CONST';

import type {RefObject} from 'react';

import {useEffect, useSyncExternalStore} from 'react';

type ConfirmationField = 'amount' | 'description' | 'merchant' | 'taxAmount';
type FocusableInput = {focus: () => void};

const lastFocusedFieldByTransaction = new Map<string, ConfirmationField>();
const pendingFieldByTransaction = new Map<string, ConfirmationField>();
const trackedTransactionIDs = new Set<string>();
const listeners = new Set<() => void>();
let focusRestoreRevision = 0;

function subscribeToFocusRestore(callback: () => void) {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
}

function getFocusRestoreRevision() {
    return focusRestoreRevision;
}

function notifyConfirmationScreenFocused(transactionID: string | undefined) {
    if (!transactionID || !pendingFieldByTransaction.has(transactionID)) {
        return;
    }
    focusRestoreRevision += 1;
    for (const listener of listeners) {
        listener();
    }
}

function enableConfirmationFocusTracking(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }
    trackedTransactionIDs.add(transactionID);
}

// Focus is UI-only state, so keep it in memory and scope it to the draft transaction instead of persisting it in Onyx.
function recordFocusedConfirmationField(transactionID: string | undefined, field: ConfirmationField) {
    if (!transactionID || !trackedTransactionIDs.has(transactionID)) {
        return;
    }
    lastFocusedFieldByTransaction.set(transactionID, field);
}

function prepareConfirmationFocusRestore(transactionID: string | undefined) {
    if (!transactionID || !trackedTransactionIDs.has(transactionID)) {
        return;
    }
    const lastFocusedField = lastFocusedFieldByTransaction.get(transactionID);
    if (lastFocusedField) {
        pendingFieldByTransaction.set(transactionID, lastFocusedField);
    }
}

function hasPendingConfirmationFocusRestore(transactionID: string | undefined, field?: ConfirmationField) {
    if (!transactionID) {
        return false;
    }
    const pendingField = pendingFieldByTransaction.get(transactionID);
    return field ? pendingField === field : pendingField !== undefined;
}

function clearConfirmationFocusState() {
    lastFocusedFieldByTransaction.clear();
    pendingFieldByTransaction.clear();
    trackedTransactionIDs.clear();
}

// The destination selection remounts the confirmation route. Defer until its transition completes so the restored
// input is attached and can open the keyboard reliably on native platforms.
function useRestoreConfirmationFieldFocus<T extends FocusableInput>(transactionID: string | undefined, field: ConfirmationField, inputRef: RefObject<T | null>) {
    const revision = useSyncExternalStore(subscribeToFocusRestore, getFocusRestoreRevision, getFocusRestoreRevision);
    const shouldRestoreFocus = hasPendingConfirmationFocusRestore(transactionID, field);

    useEffect(() => {
        if (!shouldRestoreFocus) {
            return;
        }

        const timeout = setTimeout(() => {
            if (!inputRef.current || !hasPendingConfirmationFocusRestore(transactionID, field)) {
                return;
            }
            inputRef.current.focus();
            if (transactionID) {
                pendingFieldByTransaction.delete(transactionID);
            }
        }, CONST.ANIMATED_TRANSITION);

        return () => clearTimeout(timeout);
    }, [field, inputRef, revision, shouldRestoreFocus, transactionID]);

    return shouldRestoreFocus;
}

export {
    clearConfirmationFocusState,
    enableConfirmationFocusTracking,
    hasPendingConfirmationFocusRestore,
    notifyConfirmationScreenFocused,
    prepareConfirmationFocusRestore,
    recordFocusedConfirmationField,
    useRestoreConfirmationFieldFocus,
};
