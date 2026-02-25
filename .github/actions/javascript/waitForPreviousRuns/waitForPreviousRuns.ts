import * as core from '@actions/core';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

const DEFAULT_POLL_RATE_S = 20;
const DEFAULT_QUEUE_LIMIT = 20;
const MAX_API_RETRIES = 2;
const ACTIVE_STATUSES = new Set(['in_progress', 'queued', 'waiting', 'requested', 'pending']);

async function getOlderActiveRuns(workflowID: string, currentRunID: number, queueLimit: number) {
    const response = await GithubUtils.octokit.actions.listWorkflowRuns({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workflow_id: workflowID,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: queueLimit,
    });

    return response.data.workflow_runs.filter((workflowRun) => workflowRun.id < currentRunID && ACTIVE_STATUSES.has(workflowRun.status ?? ''));
}

function run() {
    const workflowID = core.getInput('WORKFLOW_ID', {required: true});
    const currentRunID = Number(core.getInput('CURRENT_RUN_ID', {required: true}));
    const pollRateSeconds = Number(core.getInput('POLL_RATE_SECONDS')) || DEFAULT_POLL_RATE_S;
    const pollRateMs = pollRateSeconds * 1000;
    const queueLimit = Number(core.getInput('QUEUE_LIMIT')) || DEFAULT_QUEUE_LIMIT;

    core.info(`Current run ID: ${currentRunID}`);
    core.info(`Workflow ID: ${workflowID}`);
    core.info(`Poll rate: ${pollRateSeconds}s, Queue limit: ${queueLimit}`);
    core.info('Waiting for all earlier runs of this workflow to complete...');

    return new Promise<void>((resolve, reject) => {
        let intervalId: ReturnType<typeof setInterval>;
        let isChecking = false;
        let consecutiveErrors = 0;
        let pollCount = 0;
        let maxQueueDepth = 0;

        const check = () => {
            if (isChecking) {
                return;
            }
            isChecking = true;
            pollCount++;

            getOlderActiveRuns(workflowID, currentRunID, queueLimit)
                .then((olderActiveRuns) => {
                    consecutiveErrors = 0;
                    maxQueueDepth = Math.max(maxQueueDepth, olderActiveRuns.length);

                    if (olderActiveRuns.length === 0) {
                        core.notice(`Queue summary: maxRunsAhead=${maxQueueDepth}, iterations=${pollCount}, waitTime=${(pollCount - 1) * pollRateSeconds}s`);
                        core.info('No earlier runs in progress. Proceeding with build.');
                        clearInterval(intervalId);
                        resolve();
                        return;
                    }

                    const runIDs = olderActiveRuns.map((workflowRun) => `#${workflowRun.id} (${workflowRun.status})`).join(', ');
                    core.info(`Waiting for ${olderActiveRuns.length} earlier run(s): ${runIDs}. Polling again in ${pollRateSeconds}s...`);
                })
                .catch((error: unknown) => {
                    consecutiveErrors++;
                    if (consecutiveErrors > MAX_API_RETRIES) {
                        core.error(`API failed ${consecutiveErrors} times in a row. Giving up.`);
                        clearInterval(intervalId);
                        reject(error);
                        return;
                    }
                    core.warning(`API error (attempt ${consecutiveErrors}/${MAX_API_RETRIES}). Retrying next poll...`);
                })
                .finally(() => {
                    isChecking = false;
                });
        };

        check();
        intervalId = setInterval(check, pollRateMs);
    });
}

if (require.main === module) {
    run();
}

export default run;
