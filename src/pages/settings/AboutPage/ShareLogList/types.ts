type ShareLogListProps = {
    /** The source of the log file to share */
    logSource: string;
    /** Boolean to know if this was opened via test tools modal */
    isViaTestToolsModal: boolean;
};

type BaseShareLogListProps = {
    onAttachLogToReport: (reportID: string, filename: string) => void;
    /** Boolean to know if this was opened via test tools modal */
    isViaTestToolsModal: boolean;
};

export type {BaseShareLogListProps, ShareLogListProps};
