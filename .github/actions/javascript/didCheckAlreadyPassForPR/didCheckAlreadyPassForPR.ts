import CONST from '@github/libs/CONST';
import GitHubUtils from '@github/libs/GithubUtils';

import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';

import * as core from '@actions/core';
import * as github from '@actions/github';

const RUNS_PER_PAGE = 20;

type WorkflowRun = RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']['workflow_runs'][number];
type WorkflowEvent = NonNullable<RestEndpointMethodTypes['actions']['listWorkflowRuns']['parameters']['event']>;

// Same-repo runs keep the pull request number across later pushes. Fork runs leave pull_requests empty, so the head SHA has to be one of this pull request's commits.
function belongsToPullRequest(run: WorkflowRun, pullNumber: number, shas: Set<string>): boolean {
    if (run.pull_requests?.some((pullRequest) => pullRequest.number === pullNumber)) {
        return true;
    }
    return !!run.head_sha && shas.has(run.head_sha);
}

async function didCheckAlreadyPass(pullNumber: number, headRef: string, workflowFile: string, event: WorkflowEvent): Promise<boolean> {
    const commits = await GitHubUtils.paginate(
        GitHubUtils.octokit.pulls.listCommits,
        {
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_number: pullNumber,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            per_page: 100,
        },
        (response) => response.data.map((commit) => commit.sha),
    );
    const shas = new Set(commits);

    const {data} = await GitHubUtils.octokit.actions.listWorkflowRuns({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workflow_id: workflowFile,
        branch: headRef,
        event,
        status: CONST.RUN_STATUS.COMPLETED,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: RUNS_PER_PAGE,
    });

    const previousRun = data.workflow_runs.find((run) => run.id !== github.context.runId && belongsToPullRequest(run, pullNumber, shas));
    if (!previousRun) {
        core.info(`No previous completed ${workflowFile} run found for PR #${pullNumber}.`);
        return false;
    }

    core.info(`Previous ${workflowFile} run ${previousRun.html_url} concluded ${previousRun.conclusion ?? 'unknown'}.`);
    return previousRun.conclusion === CONST.RUN_STATUS_CONCLUSION.SUCCESS;
}

function run(): Promise<void> {
    const pullNumber = Number(core.getInput('PR_NUMBER', {required: true}));
    const headRef = core.getInput('HEAD_REF', {required: true});
    const workflowFile = core.getInput('WORKFLOW_FILE', {required: true});
    const event = core.getInput('EVENT', {required: true}) as WorkflowEvent;
    GitHubUtils.initOctokitWithToken(core.getInput('GITHUB_TOKEN', {required: true}));

    return didCheckAlreadyPass(pullNumber, headRef, workflowFile, event)
        .then((passed) => {
            core.setOutput('PASSED', passed);
            if (passed) {
                core.info(`Previous ${workflowFile} run passed.`);
            }
        })
        .catch((error: unknown) => {
            // A lookup failure should re-run the check, not fail the job.
            console.warn(`Could not check whether ${workflowFile} already passed, so the check will run.`, error);
            core.setOutput('PASSED', false);
        });
}

if (import.meta.main) {
    run();
}

export default run;
