import React, {createContext, useContext} from 'react';
import {View} from 'react-native';
import useReportSubmitToPopover from '@hooks/useReportSubmitToPopover';
import type {ReportSubmitToPopoverOpenOptions} from '@hooks/useReportSubmitToPopover';

type OpenReportSubmitToPopover = (options?: ReportSubmitToPopoverOpenOptions) => void;

const ReportSubmitToPopoverContext = createContext<OpenReportSubmitToPopover>(() => {
    // Default: no provider (tests / edge UI). Opening is a no-op.
});

function useOpenReportSubmitToPopover(): OpenReportSubmitToPopover {
    return useContext(ReportSubmitToPopoverContext);
}

type ReportSubmitToPopoverAnchorProps = {
    reportID: string | undefined;
    onSubmitSuccess?: () => void;
    children: React.ReactNode;
};

/** Wraps submit controls; exposes {@link useOpenReportSubmitToPopover} to descendants and renders the shared submit-to popover. */
function ReportSubmitToPopoverAnchor({reportID, onSubmitSuccess, children}: ReportSubmitToPopoverAnchorProps) {
    const {anchorRef, openReportSubmitToPopover, reportSubmitToPopover} = useReportSubmitToPopover({reportID, onSubmitSuccess});

    return (
        <ReportSubmitToPopoverContext.Provider value={openReportSubmitToPopover}>
            <View
                ref={anchorRef}
                collapsable={false}
            >
                {children}
            </View>
            {reportSubmitToPopover}
        </ReportSubmitToPopoverContext.Provider>
    );
}

export {ReportSubmitToPopoverAnchor, useOpenReportSubmitToPopover};
export type {ReportSubmitToPopoverOpenOptions};
