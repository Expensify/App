import {useIsFocused} from '@react-navigation/native';
import {useEffect, useReducer, useRef} from 'react';
import useLocalize from '@hooks/useLocalize';
import useRestartOnOdometerImagesFailure from '@hooks/useRestartOnOdometerImagesFailure';
import Log from '@libs/Log';
import {getOdometerImageUri} from '@libs/OdometerImageUtils';
import {deriveOdometerReceipt, stitchTask} from '@libs/OdometerReceipt';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import type {FileObject} from '@src/types/utils/Attachment';
import type {OdometerReceiptState, UseOdometerReceiptStitcherArgs, UseOdometerReceiptStitcherResult} from './types';

type Action = {type: 'reset'} | {type: 'beginStitch'; derivationKey: string} | {type: 'markReady'; derivationKey: string} | {type: 'fail'; message: string};

function reducer(state: OdometerReceiptState, action: Action): OdometerReceiptState {
    switch (action.type) {
        case 'reset':
            return state.kind === 'idle' ? state : {kind: 'idle'};
        case 'beginStitch':
            return {kind: 'stitching', derivationKey: action.derivationKey};
        case 'markReady':
            return {kind: 'ready', derivationKey: action.derivationKey};
        case 'fail':
            // Carry the failed derivationKey so a re-render with the same URIs won't loop into the same failure.
            return state.kind === 'stitching' ? {kind: 'error', message: action.message, derivationKey: state.derivationKey} : state;
        default:
            return state;
    }
}

function makeDerivationKey(startImage: FileObject | string | null | undefined, endImage: FileObject | string | null | undefined): string {
    return `${getOdometerImageUri(startImage) ?? ''}|${getOdometerImageUri(endImage) ?? ''}`;
}

/**
 * Composes `useRestartOnOdometerImagesFailure` and layers receipt derivation + stitching on top.
 * Kicks in once the verifier reports the source blobs are verified, then derives the receipt
 * (single / stitch / empty) and writes it to `transaction.receipt`.
 */
function useOdometerReceiptStitcher({
    transaction,
    isOdometerDistanceRequest,
    reportID,
    iouType,
    backToReport,
    onBackupHandled,
}: UseOdometerReceiptStitcherArgs): UseOdometerReceiptStitcherResult {
    // Pass undefined when the flow isn't odometer so the verifier bails per its contract.
    const {hasVerifiedBlobs} = useRestartOnOdometerImagesFailure(isOdometerDistanceRequest ? transaction : undefined, reportID, iouType, backToReport, onBackupHandled);

    const [state, dispatch] = useReducer(reducer, {kind: 'idle'} as OdometerReceiptState);
    const isFocused = useIsFocused();
    const {translate} = useLocalize();

    const abortRef = useRef<AbortController | null>(null);

    // Tracks the derivation key currently owned by this hook instance. Drives the dedupe so re-renders
    // (e.g. Onyx-emitted new transaction object identities with unchanged URIs) don't re-derive.
    // Lives in a ref instead of FSM state so dispatching `beginStitch` doesn't itself re-trigger
    // the derivation effect (which would cancel its own in-flight stitch via the cleanup function).
    const lastDerivedKeyRef = useRef<string | null>(null);

    // Deactivation: abort and reset to idle.
    useEffect(() => {
        if (isOdometerDistanceRequest && transaction) {
            return;
        }
        abortRef.current?.abort();
        lastDerivedKeyRef.current = null;
        dispatch({type: 'reset'});
    }, [isOdometerDistanceRequest, transaction]);

    // Deliberately does NOT include `state` in deps and does NOT return a cleanup function. The
    // dispatches below would otherwise cause this effect to re-run and abort its own in-flight stitch
    // (the cleanup of the previous run cancels the controller of the current run). Abort on URI change
    // happens explicitly inline; abort on unmount happens in the separate unmount-cleanup effect.
    useEffect(() => {
        if (!isOdometerDistanceRequest || !hasVerifiedBlobs || !isFocused || !transaction) {
            return;
        }

        const startImage = transaction.comment?.odometerStartImage;
        const endImage = transaction.comment?.odometerEndImage;
        const newKey = makeDerivationKey(startImage, endImage);

        // URI-equality dedupe: skip when source URIs haven't changed since the last derivation owned
        // by this instance. Covers both "ready, same URIs" and "error, same URIs" — error state
        // doesn't retry because the ref already matches.
        if (lastDerivedKeyRef.current === newKey) {
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        lastDerivedKeyRef.current = newKey;

        const derivation = deriveOdometerReceipt(startImage, endImage);

        if (derivation.mode === 'empty') {
            // Don't write an empty receipt onto fresh transactions that never had one.
            if (transaction.receipt?.source) {
                setMoneyRequestReceipt(transaction.transactionID, '', '', true, '');
            }
            dispatch({type: 'markReady', derivationKey: newKey});
            return;
        }

        if (derivation.mode === 'single') {
            setMoneyRequestReceipt(transaction.transactionID, derivation.uri, derivation.name, true, derivation.type);
            dispatch({type: 'markReady', derivationKey: newKey});
            return;
        }

        dispatch({type: 'beginStitch', derivationKey: newKey});
        stitchTask({startImage: derivation.startImage, endImage: derivation.endImage, signal: controller.signal})
            .then((result) => {
                if (controller.signal.aborted) {
                    return;
                }
                setMoneyRequestReceipt(transaction.transactionID, result.uri, result.name, true, result.type);
                dispatch({type: 'markReady', derivationKey: newKey});
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }
                Log.warn('stitchOdometerImages failed', {error});
                dispatch({type: 'fail', message: translate('iou.error.stitchOdometerImagesFailed')});
            });
    }, [isOdometerDistanceRequest, hasVerifiedBlobs, isFocused, transaction, translate]);

    useEffect(
        () => () => {
            abortRef.current?.abort();
        },
        [],
    );

    const isReady = !isOdometerDistanceRequest || state.kind === 'ready';
    const isStitching = state.kind === 'stitching';
    const error = state.kind === 'error' ? state.message : null;

    return {state, isReady, isStitching, error, hasVerifiedBlobs};
}

export type {OdometerReceiptState, UseOdometerReceiptStitcherArgs, UseOdometerReceiptStitcherResult} from './types';
export default useOdometerReceiptStitcher;
