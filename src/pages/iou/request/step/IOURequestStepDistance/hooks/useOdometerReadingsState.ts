import {useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isOdometerDraftPendingHydration} from '@libs/actions/OdometerTransactionUtils';
import CONST from '@src/CONST';
import type {OdometerDraft, Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type UseOdometerReadingsStateParams = {
    /** The transaction whose odometer values seed and re-sync the local form state. */
    currentTransaction: OnyxEntry<Transaction>;

    /** True when editing an existing odometer expense — re-sync runs whenever transaction values change. */
    isEditing: boolean;

    /** The currently selected distance-request-type tab; used to detect "switched away from odometer". */
    selectedTab: string | undefined;

    /** True while the selected-tab Onyx key is still loading — suppresses the tab-reset effect. */
    isLoadingSelectedTab: boolean;

    /** True once `useRestartOnOdometerImagesFailure` has finished verifying any blob URIs in the transaction (gates the initial-refs snapshot). */
    hasVerifiedBlobs: boolean;

    /** Save-for-later draft, if any — used to defer the initial-refs snapshot until the draft has hydrated into the transaction. */
    odometerDraft: OnyxEntry<OdometerDraft>;
};

type UseOdometerReadingsStateResult = {
    /** Current start-reading text-input value. */
    startReading: string;

    /** Setter for the start-reading text-input value. */
    setStartReading: React.Dispatch<React.SetStateAction<string>>;

    /** Current end-reading text-input value. */
    endReading: string;

    /** Setter for the end-reading text-input value. */
    setEndReading: React.Dispatch<React.SetStateAction<string>>;

    /** Validation message rendered under the inputs. */
    formError: string;

    /** Setter for the validation message. */
    setFormError: React.Dispatch<React.SetStateAction<string>>;

    /** Bumped on tab switch so the underlying `TextInput`s remount and reset their floating-label position. */
    inputKey: number;

    /** Tracks the latest `startReading` so callbacks can read it without depending on the state in their dep arrays. */
    startReadingRef: React.RefObject<string>;

    /** Tracks the latest `endReading`. */
    endReadingRef: React.RefObject<string>;

    /** The start-reading value captured at mount — used by discard-changes confirmation. */
    initialStartReadingRef: React.RefObject<string>;

    /** The end-reading value captured at mount — used by discard-changes confirmation. */
    initialEndReadingRef: React.RefObject<string>;

    /** The start-odometer image captured at mount — used by discard-changes confirmation. */
    initialStartImageRef: React.RefObject<FileObject | string | undefined>;

    /** The end-odometer image captured at mount — used by discard-changes confirmation. */
    initialEndImageRef: React.RefObject<FileObject | string | undefined>;

    /** Resets local form state and the initial refs back to their defaults. */
    resetOdometerLocalState: () => void;

    /** True once the initial baseline has been captured — gates discard-changes detection. */
    hasInitializedRefs: React.RefObject<boolean>;
};

function useOdometerReadingsState({
    currentTransaction,
    isEditing,
    selectedTab,
    isLoadingSelectedTab,
    hasVerifiedBlobs,
    odometerDraft,
}: UseOdometerReadingsStateParams): UseOdometerReadingsStateResult {
    const [startReading, setStartReading] = useState<string>('');
    const [endReading, setEndReading] = useState<string>('');
    const [formError, setFormError] = useState<string>('');
    // Key to force TextInput remount when resetting state after tab switch
    const [inputKey, setInputKey] = useState<number>(0);

    // Track initial values for DiscardChangesConfirmation
    const initialStartReadingRef = useRef<string>('');
    const initialEndReadingRef = useRef<string>('');
    const hasInitializedRefs = useRef(false);
    // Track local state via refs to avoid including them in useEffect dependencies
    const startReadingRef = useRef<string>('');
    const endReadingRef = useRef<string>('');
    const initialStartImageRef = useRef<FileObject | string | undefined>(undefined);
    const initialEndImageRef = useRef<FileObject | string | undefined>(undefined);
    const prevSelectedTabRef = useRef<string | undefined>(undefined);

    const resetOdometerLocalState = () => {
        setStartReading('');
        setEndReading('');
        startReadingRef.current = '';
        endReadingRef.current = '';
        initialStartReadingRef.current = '';
        initialEndReadingRef.current = '';
        initialStartImageRef.current = undefined;
        initialEndImageRef.current = undefined;
        hasInitializedRefs.current = false;
    };

    // Reset component state when switching away from the odometer tab
    useEffect(() => {
        if (isLoadingSelectedTab) {
            return;
        }

        const prevSelectedTab = prevSelectedTabRef.current;
        if (prevSelectedTab === CONST.TAB_REQUEST.DISTANCE_ODOMETER && selectedTab !== CONST.TAB_REQUEST.DISTANCE_ODOMETER) {
            resetOdometerLocalState();
            setFormError('');
            // Force TextInput remount to reset label position
            setInputKey((prev) => prev + 1);
        }

        prevSelectedTabRef.current = selectedTab;
    }, [selectedTab, isLoadingSelectedTab]);

    // Initialize initial values refs on mount for DiscardChangesConfirmation
    // These should never be updated after mount - they represent the "baseline" state
    useEffect(() => {
        if (hasInitializedRefs.current) {
            return;
        }
        // Skip until we have meaningful odometer data to snapshot.
        const isOdometerTransaction = currentTransaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER;
        if (!isEditing && !isOdometerTransaction) {
            return;
        }
        // Wait for blob verification — otherwise Cmd+R would snapshot a stale blob URI before
        // useRestartOnOdometerImagesFailure swaps in a fresh one, and the diff would look like an edit.
        if (!hasVerifiedBlobs) {
            return;
        }
        // Wait for the save-for-later draft to land in the transaction; otherwise post-hydration
        // values would later look like unsaved changes against this baseline.
        if (isOdometerDraftPendingHydration(odometerDraft, currentTransaction?.comment)) {
            return;
        }
        const currentStart = currentTransaction?.comment?.odometerStart;
        const currentEnd = currentTransaction?.comment?.odometerEnd;
        const startValue = currentStart !== null && currentStart !== undefined ? currentStart.toString() : '';
        const endValue = currentEnd !== null && currentEnd !== undefined ? currentEnd.toString() : '';
        initialStartReadingRef.current = startValue;
        initialEndReadingRef.current = endValue;
        initialStartImageRef.current = currentTransaction?.comment?.odometerStartImage;
        initialEndImageRef.current = currentTransaction?.comment?.odometerEndImage;
        hasInitializedRefs.current = true;
    }, [
        currentTransaction?.iouRequestType,
        currentTransaction?.comment,
        currentTransaction?.comment?.odometerStart,
        currentTransaction?.comment?.odometerEnd,
        currentTransaction?.comment?.odometerStartImage,
        currentTransaction?.comment?.odometerEndImage,
        isEditing,
        hasVerifiedBlobs,
        odometerDraft,
    ]);

    // Initialize values from transaction when editing or when transaction has data (but not when switching tabs)
    // This updates the current state, but NOT the initial refs (those are set only once on mount)
    useEffect(() => {
        const currentStart = currentTransaction?.comment?.odometerStart;
        const currentEnd = currentTransaction?.comment?.odometerEnd;

        // Only initialize if:
        // 1. We haven't initialized yet AND transaction has data, OR
        // 2. We're editing and transaction has data (to load existing values), OR
        // 3. Transaction has data but local state is empty (user navigated back from another page)
        const hasTransactionData = (currentStart !== null && currentStart !== undefined) || (currentEnd !== null && currentEnd !== undefined);
        const hasLocalState = startReadingRef.current || endReadingRef.current;

        const shouldInitialize =
            (!hasInitializedRefs.current && hasTransactionData) ||
            (isEditing && hasTransactionData && !hasLocalState) ||
            (hasTransactionData && !hasLocalState && hasInitializedRefs.current);

        if (shouldInitialize) {
            const startValue = currentStart !== null && currentStart !== undefined ? currentStart.toString() : '';
            const endValue = currentEnd !== null && currentEnd !== undefined ? currentEnd.toString() : '';

            if (startValue || endValue) {
                // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncing local form state from the Onyx transaction (an external source) when the user navigates back to the page
                setStartReading(startValue);
                setEndReading(endValue);
                startReadingRef.current = startValue;
                endReadingRef.current = endValue;
            }
        }
    }, [currentTransaction?.comment?.odometerStart, currentTransaction?.comment?.odometerEnd, isEditing]);

    return {
        startReading,
        setStartReading,
        endReading,
        setEndReading,
        formError,
        setFormError,
        inputKey,
        startReadingRef,
        endReadingRef,
        initialStartReadingRef,
        initialEndReadingRef,
        initialStartImageRef,
        initialEndImageRef,
        resetOdometerLocalState,
        hasInitializedRefs,
    };
}

export default useOdometerReadingsState;
