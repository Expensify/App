type ShareLogListProps = {
    /** The source of the log file to share */
    logSource: string;
};

type BaseShareLogListProps = {
    onAttachLogToReport: (reportID: string, filename: string) => void;
};

export type {BaseShareLogListProps, ShareLogListProps};
