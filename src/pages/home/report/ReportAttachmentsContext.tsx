import React, {useEffect, useMemo, useRef} from 'react';
import useCurrentReportID from '@hooks/useCurrentReportID';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type ReportAttachmentsContextValue = {
    isAttachmentHidden: (reportActionID: string) => boolean;
    updateHiddenAttachments: (reportActionID: string, value: boolean) => void;
};
const ReportAttachmentsContext = React.createContext<ReportAttachmentsContextValue>({} as ReportAttachmentsContextValue);

function ReportAttachmentsProvider(props: ChildrenProps) {
    const currentReportID = useCurrentReportID();
    const hiddenAttachments = useRef<Record<string, boolean>>({});

    useEffect(() => {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID]);

    const contextValue = useMemo(
        () => ({
            isAttachmentHidden: (reportActionID: string) => hiddenAttachments.current[reportActionID],
            updateHiddenAttachments: (reportActionID: string, value: boolean) => {
                hiddenAttachments.current = {
                    ...hiddenAttachments.current,
                    [reportActionID ?? '']: value ?? false,
                };
            },
        }),
        [],
    );

    return <ReportAttachmentsContext.Provider value={contextValue}>{props.children}</ReportAttachmentsContext.Provider>;
}

ReportAttachmentsProvider.displayName = 'ReportAttachmentsProvider';

export default ReportAttachmentsContext;
export {ReportAttachmentsProvider};
