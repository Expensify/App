import type {RefObject} from 'react';
import React, {createContext, useContext} from 'react';
import {View} from 'react-native';
import useReportSubmitToPopover from '@hooks/useReportSubmitToPopover';
import type {ReportSubmitToPopoverOpenOptions} from '@hooks/useReportSubmitToPopover';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

type OpenReportSubmitToPopover = (options?: ReportSubmitToPopoverOpenOptions) => void;

const ReportSubmitToPopoverContext = createContext<OpenReportSubmitToPopover>(() => {
    // Default: no provider (tests / edge UI). Opening is a no-op.
});

function useOpenReportSubmitToPopover(): OpenReportSubmitToPopover {
    return useContext(ReportSubmitToPopoverContext);
}

const ReportSubmitToPopoverAnchorRefContext = createContext<RefObject<View | null> | null>(null);

type ReportSubmitToPopoverAnchorProps = {
    reportID: string | undefined;
    onSubmitSuccess?: () => void;
    children: React.ReactNode;
    anchorAlignment?: AnchorAlignment;
};

/** Mounts modal + opens callback; descendants use {@link useOpenReportSubmitToPopover} and {@link ReportSubmitToPopoverMeasurableAnchor}. */
function ReportSubmitToPopoverRoot({reportID, onSubmitSuccess, anchorAlignment, children}: ReportSubmitToPopoverAnchorProps) {
    const {anchorRef, openReportSubmitToPopover, reportSubmitToPopover} = useReportSubmitToPopover({reportID, onSubmitSuccess, anchorAlignment});

    return (
        <ReportSubmitToPopoverAnchorRefContext.Provider value={anchorRef}>
            <ReportSubmitToPopoverContext.Provider value={openReportSubmitToPopover}>{children}</ReportSubmitToPopoverContext.Provider>
            {reportSubmitToPopover}
        </ReportSubmitToPopoverAnchorRefContext.Provider>
    );
}

/** Binds submit-to measurements to children only — use under {@link ReportSubmitToPopoverRoot}. */
function ReportSubmitToPopoverMeasurableAnchor({children}: {children: React.ReactNode}) {
    const anchorRef = useContext(ReportSubmitToPopoverAnchorRefContext);

    if (!anchorRef) {
        return children;
    }

    return (
        <View
            ref={anchorRef}
            collapsable={false}
        >
            {children}
        </View>
    );
}

/** Wraps submit controls; exposes {@link useOpenReportSubmitToPopover} to descendants and renders the shared submit-to popover. */
function ReportSubmitToPopoverAnchor({reportID, onSubmitSuccess, anchorAlignment, children}: ReportSubmitToPopoverAnchorProps) {
    return (
        <ReportSubmitToPopoverRoot
            reportID={reportID}
            onSubmitSuccess={onSubmitSuccess}
            anchorAlignment={anchorAlignment}
        >
            <ReportSubmitToPopoverMeasurableAnchor>{children}</ReportSubmitToPopoverMeasurableAnchor>
        </ReportSubmitToPopoverRoot>
    );
}

export {ReportSubmitToPopoverAnchor, ReportSubmitToPopoverMeasurableAnchor, ReportSubmitToPopoverRoot, useOpenReportSubmitToPopover};
export type {ReportSubmitToPopoverOpenOptions};
