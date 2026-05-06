import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {IOURequestType} from '@userActions/IOU';
import {hydrateOdometerDraftIntoTransaction} from '@userActions/OdometerTransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OdometerDraft, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

type UseOdometerDraftHydratorParams = {
    transaction: OnyxEntry<Transaction>;
    transactionRequestType: IOURequestType | undefined;
    isLoadingTransaction?: boolean;
    isLoadingSelectedTab?: boolean;
};

// Module-level so it survives host screen remounts; otherwise the mount effect re-fires and
// clobbers Replace/Crop/Rotate results with the stale rehydrated draft.
let lastHydratedDraft: OdometerDraft | null = null;

function useOdometerDraftHydrator({
    transaction,
    transactionRequestType,
    isLoadingTransaction = false,
    isLoadingSelectedTab = false,
}: UseOdometerDraftHydratorParams): (newIOUType: IOURequestType) => void {
    const [odometerDraft] = useOnyx(ONYXKEYS.ODOMETER_DRAFT);

    useEffect(() => {
        if (transactionRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            return;
        }
        if (!odometerDraft) {
            return;
        }
        if (isLoadingTransaction || isLoadingSelectedTab) {
            return;
        }
        if (lastHydratedDraft === odometerDraft) {
            return;
        }
        hydrateOdometerDraftIntoTransaction(transaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID, odometerDraft, transaction?.comment);
        lastHydratedDraft = odometerDraft;
        // transaction.comment intentionally excluded — it changes after our own merge and would re-fire.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionRequestType, odometerDraft, isLoadingTransaction, isLoadingSelectedTab]);

    return (newIOUType: IOURequestType) => {
        if (newIOUType !== CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            return;
        }
        // No guard: callers invoke this right after initMoneyRequest wipes the comment, so re-hydration is intended.
        hydrateOdometerDraftIntoTransaction(transaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID, odometerDraft, transaction?.comment);
        lastHydratedDraft = odometerDraft ?? null;
    };
}

export default useOdometerDraftHydrator;
