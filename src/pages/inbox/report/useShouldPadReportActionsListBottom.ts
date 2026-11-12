import useConciergeAskState from '@hooks/useConciergeAskState';
import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';

import {canUserPerformWriteAction} from '@libs/ReportUtils';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useShouldShowComposerForActiveEditDraft from './useShouldShowComposerForActiveEditDraft';

/**
 * Whether the report actions list needs space below its newest message to keep it off the composer. The recipient's
 * local time and the "ask a new question" line already sit between the two, and without a composer there is nothing
 * to keep clear of.
 */
function useShouldPadReportActionsListBottom(report: OnyxEntry<OnyxTypes.Report>, isReportArchived: boolean): boolean {
    const canShowRecipientLocalTime = useReportRecipientLocalTime({report});
    const shouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft();
    const {isHistoryExpanded: isConciergeHistoryExpanded} = useConciergeAskState(report?.reportID);
    const hideComposer = !canUserPerformWriteAction(report, isReportArchived) && !shouldShowComposerForActiveEditDraft;

    return !canShowRecipientLocalTime && !hideComposer && !isConciergeHistoryExpanded;
}

export default useShouldPadReportActionsListBottom;
