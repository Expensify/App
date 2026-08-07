import type {SelectedReports} from '@components/Search/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';

import {useEffect, useRef} from 'react';
import Onyx from 'react-native-onyx';

function useHydrateReportsFromSnapshot(
    currentSearchResults: SearchResults | undefined,
    allReports: OnyxCollection<Report> | undefined,
    /** When this parameter is provided, transactions will be hydrated as well. */
    allTransactions?: OnyxCollection<Transaction>,
    /** Only merge reports or transactions included in `selectedReports` when this parameter is provided. */
    selectedReports?: SelectedReports[],
) {
    const hasHydratedFromAllReports = useRef(false);
    const hasHydratedFromAllTransactions = useRef(false);

    useEffect(() => {
        const snapshotData = currentSearchResults?.data;
        // Guard with `hasHydratedFromAllTransactions` to prevent hydration from re-running when `allTransactions` changes
        if (!snapshotData || hasHydratedFromAllTransactions.current) {
            return;
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

        const selectedReportIDSet = new Set(selectedReports?.map(({reportID}) => reportID).filter((id) => id) ?? []);
        const isReportKey = (key: string): key is `${typeof ONYXKEYS.COLLECTION.REPORT}${string}` =>
            key.startsWith(ONYXKEYS.COLLECTION.REPORT) && !key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && !key.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
        const isTransactionKey = (key: string): key is `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION);
        for (const key of Object.keys(snapshotData)) {
            if ((!isReportKey(key) && (!allTransactions || !isTransactionKey(key))) || (isReportKey(key) && hasHydratedFromAllReports.current)) {
                continue;
            }

            if (allReports?.[key] || allTransactions?.[key]) {
                continue;
            }

            const value = snapshotData[key];
            if (value && (!selectedReports || selectedReportIDSet.has(value.reportID))) {
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

        hasHydratedFromAllReports.current = true;
        if (allTransactions) {
            hasHydratedFromAllTransactions.current = true;
        }
        // Hydration should only run once on mount using the initial snapshot data
        // Include `allTransactions` as a dependency so hydration can occur once it has a value.
        // `hasHydratedFromAllTransactions` acts as a guard to ensure hydration only happens once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allTransactions]);
}

export default useHydrateReportsFromSnapshot;
