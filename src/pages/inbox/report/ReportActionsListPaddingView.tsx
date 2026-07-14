import useKeyboardState from '@hooks/useKeyboardState';
import useOnyx from '@hooks/useOnyx';
import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import {View} from 'react-native';

import useShouldShowComposerForActiveEditDraft from './useShouldShowComposerForActiveEditDraft';

type ReportActionsListPaddingViewProps = ChildrenProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
    /** Whether the report is archived */
    isReportArchived: boolean;

    composerHeight?: number;
};

function ReportActionsListPaddingView({report, isReportArchived, composerHeight = 0, children}: ReportActionsListPaddingViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isKeyboardActive} = useKeyboardState();
    const {unmodifiedPaddings} = useSafeAreaPaddings();
    const canShowRecipientLocalTime = useReportRecipientLocalTime({report});
    const reportActionsListFSClass = FS.getChatFSClass(report);

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${report.reportID}`);

    const shouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft();
    const hideComposer = !canUserPerformWriteAction(report, isReportArchived) && !shouldShowComposerForActiveEditDraft;

    const reportPaddingBottom = StyleUtils.getReportPaddingBottom({composerHeight, isKeyboardActive, safePaddingBottom: unmodifiedPaddings.bottom ?? 0, isComposerFullSize});

    return (
        <View
            // TODO: review these styles
            style={[styles.flex1, {paddingBottom: reportPaddingBottom}]}
            fsClass={reportActionsListFSClass}
        >
            {children}
        </View>
    );
}

export default ReportActionsListPaddingView;
