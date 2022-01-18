const _ = require('underscore');
const core = require('@actions/core');
const ActionUtils = require('../../libs/ActionUtils');
const GithubUtils = require('../../libs/GithubUtils');
const promiseWhile = require('../../libs/promiseWhile');

/**
 * The maximum amount of time (in ms) we'll wait for a new workflow to start after sending the workflow_dispatch event.
 * It's two minutes :)
 * @type {number}
 */
const NEW_WORKFLOW_TIMEOUT = 120000;

/**
 * The maximum amount of time (in ms) we'll wait for a workflow to complete before giving up.
 * It's two hours :)
 * @type {number}
 */
const WORKFLOW_COMPLETION_TIMEOUT = 7200000;

/**
 * The rate in ms at which we'll poll the GitHub API to check for workflow status changes.
 * It's 10 seconds :)
 * @type {number}
 */
const POLL_RATE = 10000;

/**
 * URL prefixed to a specific workflow run
 * @type {string}
 */
const WORKFLOW_RUN_URL_PREFIX = 'https://github.com/Expensify/App/actions/runs/';

const run = function () {
    const workflow = core.getInput('WORKFLOW', {required: true});
    const inputs = ActionUtils.getJSONInput('INPUTS', {required: false}, {});

    console.log('This action has received the following inputs: ', {workflow, inputs});

    if (_.keys(inputs).length > 10) {
        const err = new Error('Inputs to the workflow_dispatch event cannot have more than 10 keys, or GitHub will 🤮');
        console.error(err.message);
        core.setFailed(err);
        process.exit(1);
    }

    // GitHub's createWorkflowDispatch returns a 204 No Content, so we need to:
    // 1) Get the last workflow run
    // 2) Trigger a new workflow run
    // 3) Poll the API until a new one appears
    // 4) Then we can poll and wait for that new workflow run to conclude
    let previousWorkflowRunID;
    let newWorkflowRunID;
    let newWorkflowRunURL;
    let hasNewWorkflowStarted = false;
    let workflowCompleted = false;
    return GithubUtils.getLatestWorkflowRunID(workflow)
        .then((lastWorkflowRunID) => {
            console.log(`Latest ${workflow} workflow run has ID: ${lastWorkflowRunID}`);
            previousWorkflowRunID = lastWorkflowRunID;

            console.log(`Dispatching workflow: ${workflow}`);
            return GithubUtils.octokit.actions.createWorkflowDispatch({
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.EXPENSIFY_CASH_REPO,
                workflow_id: workflow,
                ref: 'main',
                inputs,
            });
        })

        .catch((err) => {
            console.error(`Failed to dispatch workflow ${workflow}`, err);
            core.setFailed(err);
            process.exit(1);
        })

        // Wait for the new workflow to start
        .then(() => {
            let waitTimer = -POLL_RATE;
            return promiseWhile(
                () => !hasNewWorkflowStarted && waitTimer < NEW_WORKFLOW_TIMEOUT,
                _.throttle(
                    () => {
                        console.log(`\n🤚 Waiting for a new ${workflow} workflow run to begin...`);
                        return GithubUtils.getLatestWorkflowRunID(workflow)
                            .then((lastWorkflowRunID) => {
                                newWorkflowRunID = lastWorkflowRunID;
                                newWorkflowRunURL = WORKFLOW_RUN_URL_PREFIX + newWorkflowRunID;
                                hasNewWorkflowStarted = newWorkflowRunID !== previousWorkflowRunID;

                                if (!hasNewWorkflowStarted) {
                                    waitTimer += POLL_RATE;
                                    if (waitTimer < NEW_WORKFLOW_TIMEOUT) {
                                        // eslint-disable-next-line max-len
                                        console.log(`After ${waitTimer / 1000} seconds, there's still no new ${workflow} workflow run 🙁`);
                                    } else {
                                        // eslint-disable-next-line max-len
                                        const err = new Error(`After ${NEW_WORKFLOW_TIMEOUT / 1000} seconds, the ${workflow} workflow did not start.`);
                                        console.error(err);
                                        core.setFailed(err);
                                        process.exit(1);
                                    }
                                } else {
                                    console.log(`\n🚀 New ${workflow} run ${newWorkflowRunURL} has started`);
                                }
                            })
                            .catch((err) => {
                                console.warn('Failed to fetch latest workflow run.', err);
                            });
                    },
                    POLL_RATE,
                ),
            );
        })

        // Wait for the new workflow run to finish
        .then(() => {
            let waitTimer = -POLL_RATE;
            return promiseWhile(
                () => !workflowCompleted && waitTimer < WORKFLOW_COMPLETION_TIMEOUT,
                _.throttle(
                    () => {
                        console.log(`\n⏳ Waiting for workflow run ${newWorkflowRunURL} to finish...`);
                        return GithubUtils.octokit.actions.getWorkflowRun({
                            owner: GithubUtils.GITHUB_OWNER,
                            repo: GithubUtils.EXPENSIFY_CASH_REPO,
                            run_id: newWorkflowRunID,
                        })
                            .then(({data}) => {
                                workflowCompleted = data.status === 'completed' && data.conclusion !== null;
                                waitTimer += POLL_RATE;
                                if (waitTimer > WORKFLOW_COMPLETION_TIMEOUT) {
                                    // eslint-disable-next-line max-len
                                    const err = new Error(`After ${WORKFLOW_COMPLETION_TIMEOUT / 1000 / 60 / 60} hours, workflow ${newWorkflowRunURL} did not complete.`);
                                    console.error(err);
                                    core.setFailed(err);
                                    process.exit(1);
                                }
                                if (workflowCompleted) {
                                    if (data.conclusion === 'success') {
                                        // eslint-disable-next-line max-len
                                        console.log(`\n🎉 ${workflow} run ${newWorkflowRunURL} completed successfully! 🎉`);
                                    } else {
                                        // eslint-disable-next-line max-len
                                        const err = new Error(`🙅‍ ${workflow} run ${newWorkflowRunURL} finished with conclusion ${data.conclusion}`);
                                        console.error(err.message);
                                        core.setFailed(err);
                                        process.exit(1);
                                    }
                                }
                            });
                    },
                    POLL_RATE,
                ),
            );
        });
};

if (require.main === module) {
    run();
}

module.exports = run;
