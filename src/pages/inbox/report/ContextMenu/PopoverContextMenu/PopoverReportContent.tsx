import type {RefObject} from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {View as ViewType} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import {canWriteInReport, isUnread} from '@libs/ReportUtils';
import {ACTION_IDS, RESTRICTED_READONLY_ACTION_IDS} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import {PopoverCopyOnyxDataItem, shouldShowCopyOnyxDataAction} from '@pages/inbox/report/ContextMenu/actions/CopyOnyxDataAction';
import {PopoverDebugItem, shouldShowDebugAction} from '@pages/inbox/report/ContextMenu/actions/DebugAction';
import {PopoverMarkAsReadItem, shouldShowMarkAsReadAction} from '@pages/inbox/report/ContextMenu/actions/MarkAsReadAction';
import {shouldShowMarkAsUnreadForReport} from '@pages/inbox/report/ContextMenu/actions/MarkAsUnreadAction/markAsUnreadAction';
import PopoverMarkAsUnreadItem from '@pages/inbox/report/ContextMenu/actions/MarkAsUnreadAction/PopoverMarkAsUnreadItem';
import {PopoverPinItem, shouldShowPinAction} from '@pages/inbox/report/ContextMenu/actions/PinAction';
import {PopoverUnpinItem, shouldShowUnpinAction} from '@pages/inbox/report/ContextMenu/actions/UnpinAction';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

type PopoverReportContentProps = {
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    hideAndRun: (callback?: () => void) => void;
    contentRef: RefObject<ViewType | null>;
    shouldEnableArrowNavigation: boolean;
};

const EMPTY_SET = new Set<string>();

function PopoverReportContent({reportID, reportActionID, originalReportID, hideAndRun, contentRef, shouldEnableArrowNavigation}: PopoverReportContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {isProduction} = useEnvironment();

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canEvict: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    const isOriginalReportArchived = useReportIsArchived(originalReportID);

    const disabledActionIDs = !canWriteInReport(report) ? RESTRICTED_READONLY_ACTION_IDS : EMPTY_SET;
    const isDisabled = (id: string) => disabledActionIDs.has(id);

    const hasValidReportAction = reportActions && reportActionID && reportActionID !== '0' && reportActionID !== '-1';
    const reportAction: OnyxEntry<ReportAction> = hasValidReportAction ? reportActions[reportActionID] : undefined;

    const isPinnedChat = !!report?.isPinned;
    const isUnreadChat = isUnread(report, undefined, isOriginalReportArchived);

    const showMarkAsRead = shouldShowMarkAsReadAction({isUnreadChat}) && !isDisabled(ACTION_IDS.MARK_AS_READ);
    const showMarkAsUnread = shouldShowMarkAsUnreadForReport({isUnreadChat}) && !isDisabled(ACTION_IDS.MARK_AS_UNREAD);
    const showPin = shouldShowPinAction({isPinnedChat}) && !isDisabled(ACTION_IDS.PIN);
    const showUnpin = shouldShowUnpinAction({isPinnedChat}) && !isDisabled(ACTION_IDS.UNPIN);
    const showCopyOnyxData = shouldShowCopyOnyxDataAction({isProduction}) && !isDisabled(ACTION_IDS.COPY_ONYX_DATA);
    const showDebug = shouldShowDebugAction({isDebugModeEnabled}) && !isDisabled(ACTION_IDS.DEBUG);

    const visibleItems: React.ReactElement[] = [];
    if (showMarkAsRead) {
        visibleItems.push(
            <PopoverMarkAsReadItem
                key="markAsRead"
                reportID={reportID}
                hideAndRun={hideAndRun}
            />,
        );
    }
    if (showMarkAsUnread) {
        visibleItems.push(
            <PopoverMarkAsUnreadItem
                key="markAsUnread"
                reportID={reportID}
                reportActions={reportActions}
                reportAction={reportAction}
                currentUserAccountID={0}
                hideAndRun={hideAndRun}
            />,
        );
    }
    if (showPin) {
        visibleItems.push(
            <PopoverPinItem
                key="pin"
                reportID={reportID}
                hideAndRun={hideAndRun}
            />,
        );
    }
    if (showUnpin) {
        visibleItems.push(
            <PopoverUnpinItem
                key="unpin"
                reportID={reportID}
                hideAndRun={hideAndRun}
            />,
        );
    }
    if (showCopyOnyxData) {
        visibleItems.push(
            <PopoverCopyOnyxDataItem
                key="copyOnyxData"
                report={report}
            />,
        );
    }
    if (showDebug && reportAction) {
        visibleItems.push(
            <PopoverDebugItem
                key="debug"
                reportID={reportID}
                reportAction={reportAction}
            />,
        );
    }

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: [],
        maxIndex: visibleItems.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            {visibleItems.map((item, i) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                React.cloneElement(item as React.ReactElement<any>, {
                    isFocused: focusedIndex === i,
                    onFocus: () => setFocusedIndex(i),
                    onBlur: () => (i === visibleItems.length - 1 || i === 0) && setFocusedIndex(-1),
                }),
            )}
        </View>
    );
}

export default PopoverReportContent;
