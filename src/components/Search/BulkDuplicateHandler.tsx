import useBulkDuplicateAction from '@hooks/useBulkDuplicateAction';

import type {Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

type BulkDuplicateHandlerProps = {
    selectedTransactionsKeys: string[];
    allTransactions: OnyxCollection<Transaction>;
    allReports: OnyxCollection<Report> | undefined;
    searchData: Record<string, unknown> | undefined;
    onHandlerReady: (handler: () => void) => void;
    onAfterDuplicate?: () => void;

    /** The expense report the selection was made on, so the copies can stay on it when it can accept them */
    sourceReport?: OnyxEntry<Report>;
    sourceChatReport?: OnyxEntry<Report>;
    sourcePolicy?: OnyxEntry<Policy>;
};

/**
 * Invisible component that subscribes to action-time Onyx data for bulk duplication.
 * Only mounted when the duplicate option is visible, avoiding unnecessary global
 * subscriptions on the search page for users who aren't duplicating.
 */
function BulkDuplicateHandler({
    selectedTransactionsKeys,
    allTransactions,
    allReports,
    searchData,
    onHandlerReady,
    onAfterDuplicate,
    sourceReport,
    sourceChatReport,
    sourcePolicy,
}: BulkDuplicateHandlerProps) {
    const handleDuplicate = useBulkDuplicateAction({
        selectedTransactionsKeys,
        allTransactions,
        allReports,
        searchData,
        onAfterDuplicate,
        sourceReport,
        sourceChatReport,
        sourcePolicy,
    });

    useEffect(() => {
        onHandlerReady(handleDuplicate);
    }, [handleDuplicate, onHandlerReady]);

    return null;
}

export default BulkDuplicateHandler;
