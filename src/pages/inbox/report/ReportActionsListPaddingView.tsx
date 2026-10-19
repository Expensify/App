import useIsMobileWebLandscape from '@hooks/useIsMobileWebLandscape';
import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';
import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import {View} from 'react-native';

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
    // Shorter report header and compose row on mobile web in landscape, where vertical space is scarce.
    const shouldUseCompactChrome = useIsMobileWebLandscape();
    const hideComposer = !canUserPerformWriteAction(report, isReportArchived) && !shouldShowComposerForActiveEditDraft;
    // The gap between the last message and the compose box is the first thing to go when vertical space is scarce —
    // see useIsMobileWebLandscape.
    const shouldSeparateListFromComposer = !canShowRecipientLocalTime && !hideComposer && !shouldUseCompactChrome;

    return (
        <View
            style={[styles.flex1, shouldSeparateListFromComposer ? styles.pb4 : {}]}
            fsClass={reportActionsListFSClass}
        >
            {children}
        </View>
    );
}

export default ReportActionsListPaddingView;
