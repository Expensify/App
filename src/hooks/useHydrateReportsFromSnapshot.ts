import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';

import {useEffect, useRef} from 'react';
import Onyx from 'react-native-onyx';

function useHydrateReportsFromSnapshot(
    currentSearchResults: SearchResults | undefined,
    allReports: OnyxCollection<Report> | undefined,
    /** When this parameter is provided, transactions get one hydration pass after this collection loads. */
    allTransactions?: OnyxCollection<Transaction>,
    /** When provided, only reports or transactions included in these report IDs are hydrated. */
    selectedReportIDs?: string[],
) {
    const hasHydratedFromAllReports = useRef(false);
    const hasHydratedFromAllTransactions = useRef(false);

    useEffect(() => {
        const snapshotData = currentSearchResults?.data;
        if (!snapshotData) {
            return;
        }

        const shouldHydrateReports = !hasHydratedFromAllReports.current;
        const shouldHydrateTransactions = !!allTransactions && !hasHydratedFromAllTransactions.current;

        if (!shouldHydrateReports && !shouldHydrateTransactions) {
            return;
        }

        if (shouldHydrateReports) {
            hasHydratedFromAllReports.current = true;
        }
        if (shouldHydrateTransactions) {
            hasHydratedFromAllTransactions.current = true;
        }

        const onyxUpdates: Array<
            | {
                  onyxMethod: typeof Onyx.METHOD.MERGE;
                  key: `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;
                  value: Report;
              }
            | {
                  onyxMethod: typeof Onyx.METHOD.MERGE;
                  key: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`;
                  value: Transaction;
              }
        > = [];

        const selectedReportIDSet = new Set(selectedReportIDs);
        const isReportKey = (key: string): key is `${typeof ONYXKEYS.COLLECTION.REPORT}${string}` =>
            key.startsWith(ONYXKEYS.COLLECTION.REPORT) && !key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && !key.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
        const isTransactionKey = (key: string): key is `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION);
        for (const key of Object.keys(snapshotData)) {
            const shouldHydrateReportKey = isReportKey(key) && shouldHydrateReports;
            const shouldHydrateTransactionKey = isTransactionKey(key) && shouldHydrateTransactions;
            if (!shouldHydrateReportKey && !shouldHydrateTransactionKey) {
                continue;
            }

            if (allReports?.[key] || allTransactions?.[key]) {
                continue;
            }

            const value = snapshotData[key];
            if (value && (!selectedReportIDs || (value.reportID && selectedReportIDSet.has(value.reportID)))) {
                onyxUpdates.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key,
                    value,
                } as unknown as TupleToUnion<typeof onyxUpdates>);
            }
        }

        if (onyxUpdates.length > 0) {
            Onyx.update(onyxUpdates);
        }

        // Report hydration runs only once. Transaction hydration gets one additional pass once allTransactions has loaded.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allTransactions]);
}

export default useHydrateReportsFromSnapshot;
