import type {TupleToUnion} from 'type-fest';

const REPORT_HISTORY_ICONS = ['Receipt', 'Send', 'ThumbsUp', 'ThumbsDown', 'CircularArrowBackwards', 'Clear', 'Workflows', 'MoneyBag'] as const;

type ReportHistoryIcon = TupleToUnion<typeof REPORT_HISTORY_ICONS>;

type ReportHistoryStep = {
    /** Unique key of the row */
    key: string;

    icon: ReportHistoryIcon;

    /** The member who took or is expected to take the action. Missing when the label is a full sentence */
    accountID?: number;

    /** What happened, or what is expected to happen, at this step */
    label: string;

    /** When the action was taken. Missing for upcoming steps */
    created?: string;

    /** Upcoming steps are dimmed */
    isUpcoming: boolean;
};

export {REPORT_HISTORY_ICONS};
export type {ReportHistoryStep};
