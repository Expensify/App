import type {ValueOf} from 'type-fest';

const REPORT_HISTORY_ACTION = {
    CREATED: 'created',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REROUTED: 'rerouted',
    HELD: 'held',
    PAID: 'paid',
} as const;

type ReportHistoryAction = ValueOf<typeof REPORT_HISTORY_ACTION>;

type ReportHistoryStep = {
    /** What happened, or what is expected to happen, at this step */
    action: ReportHistoryAction;

    /** The member who took or is expected to take the action */
    accountID: number;

    /** When the action was taken. Missing for upcoming steps */
    created?: string;

    /** Whether the step already happened. Upcoming steps are dimmed */
    isCompleted: boolean;
};

export {REPORT_HISTORY_ACTION};
export type {ReportHistoryAction, ReportHistoryStep};
