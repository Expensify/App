import {generateReportID} from '@libs/ReportUtils';

import {startMoneyRequest} from '@userActions/IOU/MoneyRequest';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef} from 'react';

type MoneyRequestInitializerProps = {
    transaction: OnyxEntry<Transaction>;
    iouType: IOUType;
    reportID: string;
    draftTransactionIDs: string[] | undefined;
};

/**
 * Side-effect-only component that initializes a money request (calls startMoneyRequest)
 * on mount when the transaction has no participants yet.
 */
function MoneyRequestInitializer({transaction, iouType, reportID, draftTransactionIDs}: MoneyRequestInitializerProps) {
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (hasInitializedRef.current) {
            return;
        }
        hasInitializedRef.current = true;

        if (transaction?.transactionID && (!transaction?.isFromGlobalCreate || !isEmptyObject(transaction?.participants))) {
            return;
        }

        startMoneyRequest(
            iouType ?? CONST.IOU.TYPE.CREATE,
            // When starting to create an expense from the global FAB, If there is not an existing report yet, a random optimistic reportID is generated and used
            // for all of the routes in the creation flow.
            reportID ?? generateReportID(),
            draftTransactionIDs,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, []);

    return null;
}

MoneyRequestInitializer.displayName = 'MoneyRequestInitializer';

export default MoneyRequestInitializer;
