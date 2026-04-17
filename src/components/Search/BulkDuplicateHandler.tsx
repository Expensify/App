import {useCallback, useEffect, useInsertionEffect, useRef} from 'react';
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

    // Keep a ref to the latest handleDuplicate so we can hand the parent a stable
    // invoker below. Without this, any consumer whose props churn each render (e.g. an
    // inline onAfterDuplicate arrow in a component that the React Compiler chose not to
    // optimize) would churn handleDuplicate, refire the onHandlerReady effect, and drive
    // the parent's setDuplicateHandler state into an infinite render loop.
    const handleDuplicateRef = useRef(handleDuplicate);
    useInsertionEffect(() => {
        handleDuplicateRef.current = handleDuplicate;
    });
    const invokeDuplicate = useCallback(() => {
        handleDuplicateRef.current();
    }, []);

    useEffect(() => {
        onHandlerReady(invokeDuplicate);
    }, [invokeDuplicate, onHandlerReady]);

    return null;
}

export default BulkDuplicateHandler;
