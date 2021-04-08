const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const GithubUtils = require('../../libs/GithubUtils');
const promiseWhile = require('../../libs/promiseWhile');

/**
 * The maximum amount of time we'll wait for a new workflow to start after sending the workflow_dispatch event.
 * @type {number}
 */
const NEW_WORKFLOW_TIMEOUT = 120000;

/**
 * The rate at which we'll poll the GitHub API to check for workflow status changes.
 * @type {number}
 */
const POLL_RATE = 10000;

const run = function () {
    const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
    const githubUtils = new GithubUtils(octokit);
    const workflow = core.getInput('WORKFLOW', {required: true});
    const inputs = JSON.parse(core.getInput('INPUTS') || '{}');

    console.log('This action has received the following inputs: ', {workflow, inputs});

    if (_.keys(inputs).length > 10) {
        const err = new Error('Inputs to the workflow_dispatch event cannot have more than 10 keys, or GitHub will 🤮');
        console.error(err.message);
        core.setFailed(err);
    }

    // GitHub's createWorkflowDispatch returns a 204 No Content, so we need to:
    // 1) Get the last workflow run
    // 2) Trigger a new workflow run
    // 3) Poll the API until a new one appears
    // 4) Then we can poll and wait for that new workflow run to conclude
    let previousWorkflowRunID;
    let newWorkflowRunID;
    let hasNewWorkflowStarted = false;
    let workflowCompleted = false;
    return githubUtils.getLatestWorkflowRunID(workflow)
        .then((lastWorkflowRunID) => {
            console.log(`Latest workflow run has ID: ${lastWorkflowRunID}`);
            previousWorkflowRunID = lastWorkflowRunID;

            console.log(`Dispatching workflow: ${workflow}`);
            return octokit.actions.createWorkflowDispatch({
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.EXPENSIFY_CASH_REPO,
                workflow_id: workflow,
                ref: github.context.ref,
                inputs,
            });
        })

        .catch((err) => {
            console.error(`Failed to dispatch workflow ${workflow}`, err);
            core.setFailed(err);
        })

        // Wait for the new workflow to start
        .then(() => {
            let waitTimer = -POLL_RATE;
            return promiseWhile(
                () => !hasNewWorkflowStarted && waitTimer < NEW_WORKFLOW_TIMEOUT,
                _.throttle(
                    () => {
                        console.log(`:hand: Waiting for a new ${workflow} workflow run to begin...`);
                        githubUtils.getLatestWorkflowRunID(workflow)
                            .then((lastWorkflowRunID) => {
                                newWorkflowRunID = lastWorkflowRunID;
                                hasNewWorkflowStarted = newWorkflowRunID !== previousWorkflowRunID;
                            });

                        if (!hasNewWorkflowStarted) {
                            waitTimer += POLL_RATE;
                            if (waitTimer < NEW_WORKFLOW_TIMEOUT) {
                                // eslint-disable-next-line max-len
                                console.log(`After ${waitTimer} seconds, there's still no new ${workflow} workflow run ☹️`);
                            } else {
                                // eslint-disable-next-line max-len
                                const err = new Error(`After ${NEW_WORKFLOW_TIMEOUT} seconds, the ${workflow} workflow did not start.`);
                                console.error(err);
                                core.setFailed(err);
                            }
                        }
                    },
                    POLL_RATE,
                ),
            );
        })

        // Wait for the new workflow run to finish
        .then(() => promiseWhile(
            () => !workflowCompleted,
            _.throttle(
                () => {
                    console.log(`⏳ Waiting for workflow run ${newWorkflowRunID} to finish...`);
                    octokit.actions.getWorkflowRun({
                        owner: GithubUtils.GITHUB_OWNER,
                        repo: GithubUtils.EXPENSIFY_CASH_REPO,
                        run_id: newWorkflowRunID,
                    })
                        .then(({data}) => {
                            workflowCompleted = data.status === 'completed' && data.conclusion !== null;
                            if (workflowCompleted) {
                                if (data.conclusion === 'success') {
                                    console.log(`🎉 ${workflow} run ${newWorkflowRunID} completed successfully! 🎉`);
                                } else {
                                    // eslint-disable-next-line max-len
                                    const err = new Error(`🙅‍ ${workflow} run ${newWorkflowRunID} finished with conclusion ${data.conclusion}`);
                                    console.error(err.message);
                                    core.setFailed(err);
                                }
                            }
                        });
                },
                POLL_RATE,
            ),
        ));
};

if (require.main === module) {
    run();
}

module.exports = run;
