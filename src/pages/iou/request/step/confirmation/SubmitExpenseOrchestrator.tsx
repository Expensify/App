import React, {useState} from 'react';
import LocationPermissionModal from '@components/LocationPermissionModal';
import DateUtils from '@libs/DateUtils';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import getSubmitExpenseScenario from '@libs/telemetry/getSubmitExpenseScenario';
import {setFastPath, startTracking} from '@libs/telemetry/submitFollowUpAction';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';

type SubmitExpenseOrchestratorRenderProps = {
    onConfirm: (participants: Participant[]) => void;
    isConfirming: boolean;
};

type SubmitExpenseOrchestratorProps = {
    /** Calls the appropriate IOU action (requestMoney, trackExpense, etc.) to create the transaction. */
    createTransaction: (participants: Participant[], locationPermissionGranted?: boolean, shouldHandleNavigation?: boolean) => void;

    /** Current IOU type (request, split, track, send, invoice, etc.). */
    iouType: IOUType;

    /** Request sub-type (manual, scan, distance). Used for telemetry scenario derivation. */
    requestType: string | undefined;

    /** Whether the distance request requires GPS permission before submitting. */
    gpsRequired: boolean;

    /** ISO timestamp of the last GPS permission prompt (for throttling re-prompts). */
    lastLocationPermissionPrompt: string | undefined;

    /** True when the transaction is a distance (mileage) request. */
    isDistanceRequest: boolean;

    /** True when moving a self-tracked expense to someone else. */
    isMovingTransactionFromTrackExpense: boolean;

    /** True when the expense is not yet associated with a report. */
    isUnreported: boolean;

    /** True when categorizing a previously tracked expense. */
    isCategorizingTrackExpense: boolean;

    /** True when sharing a tracked expense with someone. */
    isSharingTrackExpense: boolean;

    /** True when the expense is a per-diem type. */
    isPerDiemRequest: boolean;

    /** Receipt files attached to the transaction (keyed by receipt hash). */
    receiptFiles: Record<string, Receipt | undefined>;

    /** Persisted flag on the transaction: flow originated from the global create button. */
    isFromGlobalCreateOnTransaction: boolean;

    /** Persisted flag on the transaction: flow originated from the floating action button. */
    isFromFloatingActionButtonOnTransaction: boolean;

    /** Render prop receiving onConfirm and isConfirming. */
    children: (props: SubmitExpenseOrchestratorRenderProps) => React.ReactNode;
};

/**
 * Encapsulates the submit-expense decision tree: which fast-path handler to
 * use, telemetry lifecycle, navigation orchestration, and the GPS permission
 * flow. Exposes `onConfirm` and `isConfirming` via a render prop so the
 * parent only needs to wire them to `MoneyRequestConfirmationList`.
 *
 * A render-prop component (rather than a hook) is used because this wrapper
 * needs to render `LocationPermissionModal` conditionally. A hook cannot own
 * JSX, so we'd need to return the modal element and have the caller place it
 * - which spreads the concern across two files again.
 *
 * Decision tree (evaluated top to bottom in onConfirm):
 *   Currently only the default handler is active. Fast-path handlers for
 *   dismiss-first navigation patterns will be added in a follow-up PR.
 */
function SubmitExpenseOrchestrator({
    createTransaction,
    iouType,
    requestType,
    gpsRequired,
    lastLocationPermissionPrompt,
    isDistanceRequest,
    isMovingTransactionFromTrackExpense,
    isUnreported,
    isCategorizingTrackExpense,
    isSharingTrackExpense,
    isPerDiemRequest,
    receiptFiles,
    isFromGlobalCreateOnTransaction,
    isFromFloatingActionButtonOnTransaction,
    children,
}: SubmitExpenseOrchestratorProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [selectedParticipantList, setSelectedParticipantList] = useState<Participant[]>([]);
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);

    const startSubmitSpans = () => {
        const hasReceiptFiles = Object.values(receiptFiles).some((receipt) => !!receipt);
        const isFromGlobalCreateForTelemetry = !!(isFromGlobalCreateOnTransaction || isFromFloatingActionButtonOnTransaction);
        const scenario = getSubmitExpenseScenario({
            iouType,
            isDistanceRequest,
            isMovingTransactionFromTrackExpense,
            isUnreported,
            isCategorizingTrackExpense,
            isSharingTrackExpense,
            isPerDiemRequest,
            isFromGlobalCreate: isFromGlobalCreateForTelemetry,
            hasReceiptFiles,
        });

        startTracking({
            scenario,
            iouType,
            requestType: requestType ?? 'unknown',
            isFromGlobalCreate: isFromGlobalCreateForTelemetry,
            hasReceipt: hasReceiptFiles,
        });
    };

    const handleDefaultSubmit = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
        requestAnimationFrame(() => {
            createTransaction(listOfParticipants);
            requestAnimationFrame(() => {
                setIsConfirming(false);
            });
        });
    };

    const onConfirm = (listOfParticipants: Participant[]) => {
        setIsConfirming(true);
        setSelectedParticipantList(listOfParticipants);

        if (gpsRequired) {
            const shouldStartPermissionFlow =
                !lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt) &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt)) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);

            if (shouldStartPermissionFlow) {
                setStartLocationPermissionFlow(true);
                return;
            }
        }

        startSubmitSpans();
        handleDefaultSubmit(listOfParticipants);
    };

    return (
        <>
            {!!gpsRequired && (
                <LocationPermissionModal
                    startPermissionFlow={startLocationPermissionFlow}
                    resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                    onGrant={() => {
                        startSubmitSpans();
                        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
                        navigateAfterInteraction(() => {
                            createTransaction(selectedParticipantList, true);
                        });
                    }}
                    onDeny={() => {
                        startSubmitSpans();
                        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
                        updateLastLocationPermissionPrompt();
                        navigateAfterInteraction(() => {
                            createTransaction(selectedParticipantList, false);
                        });
                    }}
                    onInitialGetLocationCompleted={() => {
                        setIsConfirming(false);
                    }}
                />
            )}
            {children({onConfirm, isConfirming})}
        </>
    );
}

export default SubmitExpenseOrchestrator;
