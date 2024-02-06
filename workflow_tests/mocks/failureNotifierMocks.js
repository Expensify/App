/* eslint-disable rulesdir/no-negated-variables */
const utils = require('../utils/utils');

// notifyfailure
const FAILURENOTIFIER__NOTIFYFAILURE__FETCH_WORKFLOW_RUN_JOBS__STEP_MOCK = utils.createMockStep('Fetch Workflow Run Jobs', 'Fetch Workflow Run Jobs', 'NOTIFYFAILURE', [], []);
const FAILURENOTIFIER__NOTIFYFAILURE__PROCESS_EACH_FAILED_JOB__STEP_MOCK = utils.createMockStep('Process Each Failed Job', 'Process Each Failed Job', 'NOTIFYFAILURE', [], []);
const FAILURENOTIFIER__NOTIFYFAILURE__STEP_MOCKS = [FAILURENOTIFIER__NOTIFYFAILURE__FETCH_WORKFLOW_RUN_JOBS__STEP_MOCK, FAILURENOTIFIER__NOTIFYFAILURE__PROCESS_EACH_FAILED_JOB__STEP_MOCK];

module.exports = {
    FAILURENOTIFIER__NOTIFYFAILURE__STEP_MOCKS,
};
