/* eslint-disable @typescript-eslint/naming-convention */
import lodashThrottle from 'lodash/throttle';
import {getStringInput} from '@github/libs/ActionUtils';
import CONST from '@github/libs/CONST';
import GitHubUtils from '@github/libs/GithubUtils';
import {promiseDoWhile} from '@github/libs/promiseWhile';

type CurrentStagingDeploys = Awaited<ReturnType<typeof GitHubUtils.octokit.actions.listWorkflowRuns>>['data']['workflow_runs'];

function run() {
    console.info('[awaitStagingDeploys] POLL RATE', CONST.POLL_RATE);
    console.info('[awaitStagingDeploys] run()');
    console.info('[awaitStagingDeploys] getStringInput', getStringInput);
    console.info('[awaitStagingDeploys] GitHubUtils', GitHubUtils);
    console.info('[awaitStagingDeploys] promiseDoWhile', promiseDoWhile);

    const tag = getStringInput('TAG', {required: false});
    console.info('[awaitStagingDeploys] run() tag', tag);

    let currentStagingDeploys: CurrentStagingDeploys = [];

    console.info('[awaitStagingDeploys] run()  _.throttle', lodashThrottle);

    const throttleFunc = () =>
        Promise.all([
            // These are active deploys
            GitHubUtils.octokit.actions.listWorkflowRuns({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                workflow_id: 'platformDeploy.yml',
                event: 'push',
                branch: tag,
            }),

            // These have the potential to become active deploys, so we need to wait for them to finish as well (unless we're looking for a specific tag)
            // In this context, we'll refer to unresolved preDeploy workflow runs as staging deploys as well
            !tag &&
                GitHubUtils.octokit.actions.listWorkflowRuns({
                    owner: CONST.GITHUB_OWNER,
                    repo: CONST.APP_REPO,
                    workflow_id: 'preDeploy.yml',
                }),
        ])
            .then((responses) => {
                console.info('[awaitStagingDeploys] listWorkflowRuns responses', responses);
                const workflowRuns = responses[0].data.workflow_runs;
                if (!tag && typeof responses[1] === 'object') {
                    workflowRuns.push(...responses[1].data.workflow_runs);
                }
                console.info('[awaitStagingDeploys] workflowRuns', workflowRuns);
                return workflowRuns;
            })
            .then((workflowRuns) => (currentStagingDeploys = workflowRuns.filter((workflowRun) => workflowRun.status !== 'completed')))
            .then(() => {
                console.info('[awaitStagingDeploys] currentStagingDeploys', currentStagingDeploys);
                console.log(
                    !currentStagingDeploys.length
                        ? 'No current staging deploys found'
                        : `Found ${currentStagingDeploys.length} staging deploy${currentStagingDeploys.length > 1 ? 's' : ''} still running...`,
                );
            });
    console.info('[awaitStagingDeploys] run() throttleFunc', throttleFunc);

    return promiseDoWhile(
        () => !!currentStagingDeploys.length,
        lodashThrottle(
            throttleFunc,

            // Poll every 60 seconds instead of every 10 seconds
            CONST.POLL_RATE * 6,
        ),
    );
}

if (require.main === module) {
    run();
}

export default run;
