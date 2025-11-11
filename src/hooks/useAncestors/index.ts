import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import type {Ancestor} from '@libs/ReportUtils';
import {getAncestors} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

/**
 * Fetches ancestor reports and their associated actions for a given report.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param shouldExcludeAncestor - Callback to determine if an ancestor should be excluded.
 * @returns An array of ancestor reports and their associated actions.
 */

function useAncestors(report: OnyxEntry<Report>, shouldExcludeAncestorReportActionCallback: (reportAction: ReportAction, isFirstAncestor: boolean) => boolean = () => false): Ancestor[] {
    const [reportCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportDraftCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT, {canBeMissing: true});
    const [reportActionsCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    return useMemo(() => {
        return getAncestors(report, reportCollection, reportDraftCollection, reportActionsCollection, shouldExcludeAncestorReportActionCallback);
    }, [report, reportCollection, reportDraftCollection, reportActionsCollection, shouldExcludeAncestorReportActionCallback]);
}

export default useAncestors;
