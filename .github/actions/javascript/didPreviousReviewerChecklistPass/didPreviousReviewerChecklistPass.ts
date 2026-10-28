import CONST from '@github/libs/CONST';
import GitHubUtils from '@github/libs/GithubUtils';

import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';

import * as core from '@actions/core';
import * as github from '@actions/github';

const WORKFLOW_FILE = 'reviewerChecklist.yml';
const RUNS_PER_PAGE = 20;

type WorkflowRun = RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']['workflow_runs'][number];

// Same-repo runs keep the pull request number across later pushes. Fork runs leave pull_requests empty, so the head SHA has to be one of this pull request's commits.
function belongsToPullRequest(run: WorkflowRun, pullNumber: number, shas: Set<string>): boolean {
    if (run.pull_requests?.some((pullRequest) => pullRequest.number === pullNumber)) {
        return true;
    }
    return !!run.head_sha && shas.has(run.head_sha);
}

async function didPreviousRunPass(pullNumber: number, headRef: string): Promise<boolean> {
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
        workflow_id: WORKFLOW_FILE,
        branch: headRef,
        event: 'pull_request_review',
        status: CONST.RUN_STATUS.COMPLETED,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: RUNS_PER_PAGE,
    });

    const previousRun = data.workflow_runs.find((run) => run.id !== github.context.runId && belongsToPullRequest(run, pullNumber, shas));
    if (!previousRun) {
        core.info(`No previous reviewer checklist run found for PR #${pullNumber}.`);
        return false;
    }

    core.info(`Previous run ${previousRun.html_url} concluded ${previousRun.conclusion ?? 'unknown'}.`);
    return previousRun.conclusion === CONST.RUN_STATUS_CONCLUSION.SUCCESS;
}

function run(): Promise<void> {
    const pullNumber = Number(core.getInput('PR_NUMBER', {required: true}));
    const headRef = core.getInput('HEAD_REF', {required: true});
    GitHubUtils.initOctokitWithToken(core.getInput('GITHUB_TOKEN', {required: true}));

    return didPreviousRunPass(pullNumber, headRef)
        .then((passed) => {
            core.setOutput('PASSED', passed);
            if (passed) {
                core.info('Previous reviewer checklist run passed.');
            }
        })
        .catch((error: unknown) => {
            // A lookup failure should re-run the checklist, not fail the job.
            console.warn('Could not check the previous reviewer checklist run, so the check will run.', error);
            core.setOutput('PASSED', false);
        });
}

if (import.meta.main) {
    run();
}

export default run;
