import {useEffect} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useBulkDuplicateReportAction from '@hooks/useBulkDuplicateReportAction';
import type {Report} from '@src/types/onyx';
import type {SelectedReports} from './types';

type BulkDuplicateReportHandlerProps = {
    selectedReports: SelectedReports[];
    allReports: OnyxCollection<Report> | undefined;
    searchData: Record<string, unknown> | undefined;
    onHandlerReady: (handler: () => void) => void;
};

/**
 * Invisible component that subscribes to action-time Onyx data for bulk report duplication.
 * Only mounted when the duplicate report option is visible, avoiding unnecessary global
 * subscriptions on the search page for users who aren't duplicating.
 */
function BulkDuplicateReportHandler({selectedReports, allReports, searchData, onHandlerReady}: BulkDuplicateReportHandlerProps) {
    const handleDuplicateReports = useBulkDuplicateReportAction({selectedReports, allReports, searchData});

    useEffect(() => {
        onHandlerReady(handleDuplicateReports);
    }, [handleDuplicateReports, onHandlerReady]);

    return null;
}

export default BulkDuplicateReportHandler;
