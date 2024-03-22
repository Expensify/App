/* eslint-disable @typescript-eslint/naming-convention */
import ActionUtils from '../../../libs/ActionUtils';
import CONST from '../../../libs/CONST';
import GitHubUtils from '../../../libs/GithubUtils';

type Workflow = {
    status: string;
};

async function run(): Promise<void> {
    const tag = ActionUtils.getStringInput('TAG', {required: false});
    let currentStagingDeploys = [];

    const throttledPoll = async (): Promise<void> => {
        const responses = await Promise.all([
            GitHubUtils.octokit.actions.listWorkflowRuns({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                workflow_id: 'platformDeploy.yml',
                event: 'push',
                branch: tag,
            }),
            !tag &&
                GitHubUtils.octokit.actions.listWorkflowRuns({
                    owner: CONST.GITHUB_OWNER,
                    repo: CONST.APP_REPO,
                    workflow_id: 'preDeploy.yml',
                }),
        ]);

        const workflowRuns = responses[0].data.workflow_runs;
        if (!tag && responses[1]) {
            workflowRuns.push(...responses[1].data.workflow_runs);
        }
        currentStagingDeploys = workflowRuns.filter((workflowRun: Workflow) => workflowRun.status !== 'completed');

        console.log(
            currentStagingDeploys.length === 0
                ? 'No current staging deploys found'
                : `Found ${currentStagingDeploys.length} staging deploy${currentStagingDeploys.length > 1 ? 's' : ''} still running...`,
        );
    };

    const pollInterval = GitHubUtils.POLL_RATE * 6;

    do {
        await throttledPoll();
        await new Promise((resolve) => {
            setTimeout(resolve, pollInterval * 1000);
        });
    } while (currentStagingDeploys.length > 0);
}

if (require.main === module) {
    run();
}

export default run;
