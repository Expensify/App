/* eslint-disable @typescript-eslint/naming-convention */

/* eslint-disable rulesdir/no-negated-variables */
import {createMockStep} from '../utils/utils';

// notifyfailure
const FAILURENOTIFIER__NOTIFYFAILURE__FETCH_WORKFLOW_RUN_JOBS__STEP_MOCK = createMockStep('Fetch Workflow Run Jobs', 'Fetch Workflow Run Jobs', 'NOTIFYFAILURE', [], []);
const FAILURENOTIFIER__NOTIFYFAILURE__PROCESS_EACH_FAILED_JOB__STEP_MOCK = createMockStep('Process Each Failed Job', 'Process Each Failed Job', 'NOTIFYFAILURE', [], []);
const FAILURENOTIFIER__NOTIFYFAILURE__STEP_MOCKS = [FAILURENOTIFIER__NOTIFYFAILURE__FETCH_WORKFLOW_RUN_JOBS__STEP_MOCK, FAILURENOTIFIER__NOTIFYFAILURE__PROCESS_EACH_FAILED_JOB__STEP_MOCK];

export default {
    FAILURENOTIFIER__NOTIFYFAILURE__STEP_MOCKS,
};
