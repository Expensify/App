import FSClassView from '@components/FSClassView';

import useConciergeAskState from '@hooks/useConciergeAskState';
import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';
import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';

import useShouldShowComposerForActiveEditDraft from './useShouldShowComposerForActiveEditDraft';

type ReportActionsListPaddingViewProps = ChildrenProps & {
    report: OnyxTypes.Report;
    isReportArchived: boolean;
};

function ReportActionsListPaddingView({report, isReportArchived, children}: ReportActionsListPaddingViewProps) {
    const styles = useThemeStyles();
    const canShowRecipientLocalTime = useReportRecipientLocalTime({report});
    const reportActionsListFSClass = FS.getChatFSClass(report);

    const shouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft();
    const shouldUseCompactChrome = useIsMobileWebLandscape();
    const {isHistoryExpanded: isConciergeHistoryExpanded} = useConciergeAskState(report.reportID);
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
