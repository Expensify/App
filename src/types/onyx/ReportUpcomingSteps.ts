import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** What is expected to happen at an upcoming step */
type ReportUpcomingStepAction = ValueOf<typeof CONST.REPORT.UPCOMING_STEP_ACTION>;

/** A step of the report's workflow that hasn't happened yet */
type ReportUpcomingStep = {
    /** What is expected to happen at this step */
    action: ReportUpcomingStepAction;

    /** The member expected to take the action */
    actorAccountID: number;
};

/** The report's upcoming workflow steps, in order, starting with the current step */
type ReportUpcomingSteps = {
    steps: ReportUpcomingStep[];
};

export default ReportUpcomingSteps;
export type {ReportUpcomingStep, ReportUpcomingStepAction};
