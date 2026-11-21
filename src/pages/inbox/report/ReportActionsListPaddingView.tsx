import FSClassView from '@components/FSClassView';

import useConciergeAskState from '@hooks/useConciergeAskState';
import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useOnyx from '@hooks/useOnyx';
import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';
import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {getStableReportSelector} from '@selectors/Report';
import React from 'react';

import useShouldShowComposerForActiveEditDraft from './useShouldShowComposerForActiveEditDraft';

type ReportActionsListPaddingViewProps = ChildrenProps & {
    reportID: string;
    isReportArchived: boolean;
};

function ReportActionsListPaddingView({reportID, isReportArchived, children}: ReportActionsListPaddingViewProps) {
    // Stable projection drops the `last*` heartbeat fields. None of them are read below, so this view does not subscribe to their changes.
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getStableReportSelector});
    const styles = useThemeStyles();
    const canShowRecipientLocalTime = useReportRecipientLocalTime({report});
    const reportActionsListFSClass = FS.getChatFSClass(report);

    const shouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft();
    const shouldUseCompactChrome = useIsMobileWebLandscape();
    const {isHistoryExpanded: isConciergeHistoryExpanded} = useConciergeAskState(reportID);
    const hideComposer = !canUserPerformWriteAction(report, isReportArchived) && !shouldShowComposerForActiveEditDraft;
    const applyPaddingBetweenListAndComposer = !canShowRecipientLocalTime && !hideComposer && !isConciergeHistoryExpanded && !shouldUseCompactChrome;

    return (
        <FSClassView
            style={[styles.flex1, applyPaddingBetweenListAndComposer ? styles.pb4 : {}]}
            forwardedFSClass={reportActionsListFSClass}
        >
            {children}
        </FSClassView>
    );
}

export default ReportActionsListPaddingView;
