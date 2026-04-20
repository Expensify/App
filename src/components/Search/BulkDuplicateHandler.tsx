import {useEffect} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useBulkDuplicateAction from '@hooks/useBulkDuplicateAction';
import type {Report, Transaction} from '@src/types/onyx';

type BulkDuplicateHandlerProps = {
    selectedTransactionsKeys: string[];
    allTransactions: OnyxCollection<Transaction>;
    allReports: OnyxCollection<Report> | undefined;
    searchData: Record<string, unknown> | undefined;
    onHandlerReady: (handler: () => void) => void;
    onAfterDuplicate?: () => void;
};

/**
 * Invisible component that subscribes to action-time Onyx data for bulk duplication.
 * Only mounted when the duplicate option is visible, avoiding unnecessary global
 * subscriptions on the search page for users who aren't duplicating.
 */
function BulkDuplicateHandler({selectedTransactionsKeys, allTransactions, allReports, searchData, onHandlerReady, onAfterDuplicate}: BulkDuplicateHandlerProps) {
    const handleDuplicate = useBulkDuplicateAction({selectedTransactionsKeys, allTransactions, allReports, searchData, onAfterDuplicate});

    useEffect(() => {
        onHandlerReady(handleDuplicate);
    }, [handleDuplicate, onHandlerReady]);

    return null;
}

export default BulkDuplicateHandler;
