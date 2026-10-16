import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import * as core from '@actions/core';

// Blocks the production deploy when the staging build for the version being shipped never made it to the
// stores. See https://github.com/Expensify/App/issues/65216.

const STAGING_BRANCH = 'staging';
const DEPLOY_WORKFLOW = 'deploy.yml';

// The jobs that put a build in front of the stores, which is what production later submits. Their builds are not
// checked separately: each upload `needs:` its build without `always()`, so a failed build leaves the upload
// `skipped`. An allowlist because the BrowserStack and Applause uploads are `continue-on-error: true`, which
// still leaves them with `conclusion: failure`.
const NATIVE_UPLOAD_JOBS = [
    {platform: 'Android', job: 'Upload Android to Google Play'},
    {platform: 'iOS', job: 'Upload iOS to TestFlight'},
] as const;

type Job = {name: string; conclusion: string | null};

function setResult(allSucceeded: boolean, reason: string, workflowRunURL = '') {
    const message = workflowRunURL ? `${reason} ${workflowRunURL}` : reason;
    console.log(message);
    core.setOutput('ALL_NATIVE_BUILDS_SUCCEEDED', allSucceeded);
    core.setOutput('REASON', message);
}

async function getStagingTag(): Promise<string> {
    const packageJSON: unknown = JSON.parse(await GithubUtils.getFileContents('package.json', STAGING_BRANCH));
    if (typeof packageJSON !== 'object' || packageJSON === null || !('version' in packageJSON) || typeof packageJSON.version !== 'string' || !packageJSON.version) {
        throw new Error(`Could not read a version from package.json on ${STAGING_BRANCH}`);
    }
    return `${packageJSON.version}-${STAGING_BRANCH}`;
}

async function run(): Promise<void> {
    try {
        const tag = await getStagingTag();

        // deploy.yml triggers on `push: branches`, so head_branch is never a tag and runs can't be found by one.
        const {data: ref} = await GithubUtils.octokit.git.getRef({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            ref: `tags/${tag}`,
        });
        const taggedSHA = ref.object.sha;
        console.log(`${tag} points at ${taggedSHA}`);

        // `branch` is required: promoting staging to production fast-forwards, so the newer production run shares
        // this head_sha and would be returned first.
        const {data: workflowRuns} = await GithubUtils.octokit.actions.listWorkflowRuns({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            workflow_id: DEPLOY_WORKFLOW,
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            head_sha: taggedSHA,
            branch: STAGING_BRANCH,
        });

        const deployRun = workflowRuns.workflow_runs.at(0);
        if (!deployRun) {
            setResult(false, `Could not find a ${DEPLOY_WORKFLOW} run for ${tag} (${taggedSHA}).`);
            return;
        }

        const workflowRunURL = deployRun.html_url ?? '';

        // `filter` defaults to `latest`, so re-running a failed job clears this check.
        const {data: jobsResponse} = await GithubUtils.octokit.actions.listJobsForWorkflowRun({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            run_id: deployRun.id,
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            per_page: 100,
        });
        const jobs: Job[] = jobsResponse.jobs;

        const failedPlatforms: string[] = [];
        const missingJobs: string[] = [];

        for (const {platform, job: name} of NATIVE_UPLOAD_JOBS) {
            const uploadJob = jobs.find((job) => job.name === name);

            if (!uploadJob) {
                missingJobs.push(name);
                continue;
            }

            // `skipped` (its build failed) and `cancelled` both mean nothing reached the store for this platform.
            if (uploadJob.conclusion !== 'success') {
                failedPlatforms.push(platform);
            }
        }

        if (missingJobs.length > 0) {
            setResult(false, `Could not find these expected jobs in the staging deploy for ${tag}: ${missingJobs.join(', ')}.`, workflowRunURL);
            return;
        }

        if (failedPlatforms.length > 0) {
            setResult(false, `The staging deploy for ${tag} did not succeed on: ${failedPlatforms.join(', ')}.`, workflowRunURL);
            return;
        }

        setResult(true, `The staging deploy for ${tag} succeeded on all native platforms.`, workflowRunURL);
    } catch (error) {
        // Logged rather than setFailed: failing the step would skip the reopen-and-comment step below, leaving
        // the deployer with a silently closed checklist. Blocking via the output is the useful response here.
        core.error(error instanceof Error ? error : String(error));
        setResult(false, 'Could not verify the staging builds because a GitHub API call failed.');
    }
}

if (import.meta.main) {
    run();
}

export default run;
