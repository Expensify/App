import {beforeAll, beforeEach, describe, expect, jest, test} from 'bun:test';

import run from '@github/actions/javascript/verifyStagingBuildsSucceeded/verifyStagingBuildsSucceeded';
import type {InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

import * as core from '@actions/core';

import createMock from '../utils/createMock';
import materializeOctokitNamespace from '../utils/materializeOctokitNamespace';

// Fixtures mirror GitHub API response shapes, whose keys are snake_case.
/* eslint-disable @typescript-eslint/naming-convention */

type ListWorkflowRunsMethod = InternalOctokit['rest']['actions']['listWorkflowRuns'];
type ListJobsMethod = InternalOctokit['rest']['actions']['listJobsForWorkflowRun'];
type GetRefMethod = InternalOctokit['rest']['git']['getRef'];
type ListWorkflowRunsResponse = Awaited<ReturnType<ListWorkflowRunsMethod>>;
type ListJobsResponse = Awaited<ReturnType<ListJobsMethod>>;
type GetRefResponse = Awaited<ReturnType<GetRefMethod>>;
type JobConclusion = NonNullable<ListJobsResponse['data']['jobs'][number]['conclusion']>;

// Fixtures from the real 9.4.24-0 release: staging run 28396052978 failed on "Upload iOS to TestFlight", and
// production run 28441211084 then failed on "Submit iOS for production rollout".
const VERSION = '9.4.24-0';
const TAG = `${VERSION}-staging`;
const TAGGED_SHA = '626e04b6a4a5cd8e0e5e9e5ba39e5e6cb0e6a1b6';
const RUN_ID = 28396052978;
const RUN_URL = `https://github.com/Expensify/App/actions/runs/${RUN_ID}`;

const ANDROID_BUILD = 'Build Android HybridApp / Build Android app';
const ANDROID_UPLOAD = 'Upload Android to Google Play';
const IOS_BUILD = 'Build iOS HybridApp / Build iOS HybridApp';
const IOS_UPLOAD = 'Upload iOS to TestFlight';

// Job names as the API reports them. A Map because these keys are display names, not identifiers.
function stagingDeployJobs(overrides: Array<[string, JobConclusion | null]> = []): ListJobsResponse {
    const conclusions = new Map<string, JobConclusion | null>([
        [ANDROID_BUILD, 'success'],
        [ANDROID_UPLOAD, 'success'],
        [IOS_BUILD, 'success'],
        [IOS_UPLOAD, 'success'],
        ['Build Web / Build Web', 'success'],
        ['Deploy Web to S3', 'success'],

        // Production-only, skipped on every staging deploy.
        ['Submit Android for production rollout', 'skipped'],
        ['Submit iOS for production rollout', 'skipped'],

        // `if: always()` and never exits non-zero, so it reports success even when a platform failed.
        ['checkDeploymentSuccess', 'success'],
    ]);

    for (const [name, conclusion] of overrides) {
        conclusions.set(name, conclusion);
    }

    return createMock<ListJobsResponse>({
        data: {jobs: Array.from(conclusions, ([name, conclusion]) => ({name, status: 'completed', conclusion}))},
    });
}

const mockSetOutput = jest.fn<(name: string, value: unknown) => void>();
const mockGetFileContents = jest.fn<(path: string, ref?: string) => Promise<string>>();
let mockGetRef: ReturnType<typeof jest.spyOn<InternalOctokit['rest']['git'], 'getRef'>>;
let mockListWorkflowRuns: ReturnType<typeof jest.spyOn<InternalOctokit['rest']['actions'], 'listWorkflowRuns'>>;
let mockListJobs: ReturnType<typeof jest.spyOn<InternalOctokit['rest']['actions'], 'listJobsForWorkflowRun'>>;

function outputs(): Record<string, unknown> {
    return Object.fromEntries(mockSetOutput.mock.calls);
}

beforeAll(() => {
    jest.spyOn(core, 'setOutput').mockImplementation(mockSetOutput);
    jest.spyOn(core, 'error').mockImplementation(() => {});
    jest.spyOn(GithubUtils, 'getFileContents').mockImplementation(mockGetFileContents);

    GithubUtils.initOctokitWithToken('fake_token');
    if (!GithubUtils.internalOctokit) {
        throw new Error('Expected GitHubUtils to initialize Octokit');
    }

    GithubUtils.internalOctokit.rest.actions = materializeOctokitNamespace(GithubUtils.internalOctokit.rest.actions);
    GithubUtils.internalOctokit.rest.git = materializeOctokitNamespace(GithubUtils.internalOctokit.rest.git);
    mockGetRef = jest.spyOn(GithubUtils.internalOctokit.rest.git, 'getRef');
    mockListWorkflowRuns = jest.spyOn(GithubUtils.internalOctokit.rest.actions, 'listWorkflowRuns');
    mockListJobs = jest.spyOn(GithubUtils.internalOctokit.rest.actions, 'listJobsForWorkflowRun');
});

beforeEach(() => {
    mockSetOutput.mockClear();
    mockGetFileContents.mockClear().mockResolvedValue(JSON.stringify({version: VERSION}));
    mockGetRef.mockClear().mockResolvedValue(createMock<GetRefResponse>({data: {object: {sha: TAGGED_SHA}}}));
    mockListJobs.mockClear().mockResolvedValue(stagingDeployJobs());
    mockListWorkflowRuns.mockClear().mockResolvedValue(
        createMock<ListWorkflowRunsResponse>({
            data: {
                workflow_runs: [
                    {
                        id: RUN_ID,
                        status: 'completed',
                        conclusion: 'failure',
                        head_sha: TAGGED_SHA,
                        html_url: RUN_URL,
                    },
                ],
            },
        }),
    );
});

describe('verifyStagingBuildsSucceeded', () => {
    test('resolves the version from package.json on staging and looks up that tag', async () => {
        await run();

        expect(mockGetFileContents).toHaveBeenCalledWith('package.json', 'staging');
        expect(mockGetRef).toHaveBeenCalledWith(expect.objectContaining({ref: `tags/${TAG}`}));
        expect(mockListWorkflowRuns).toHaveBeenCalledWith(
            expect.objectContaining({
                workflow_id: 'deploy.yml',
                head_sha: TAGGED_SHA,
            }),
        );
    });

    // Production shares the staging run's head_sha after the fast-forward, and is newer.
    test('restricts the run lookup to the staging branch', async () => {
        await run();

        expect(mockListWorkflowRuns).toHaveBeenCalledWith(expect.objectContaining({branch: 'staging'}));
    });

    test('clears a staging release that succeeded on every native platform', async () => {
        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(true);
        expect(String(outputs().REASON)).toContain('succeeded on all native platforms');
    });

    test('flags a staging release whose TestFlight upload failed', async () => {
        mockListJobs.mockResolvedValue(stagingDeployJobs([[IOS_UPLOAD, 'failure']]));

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(false);
        expect(String(outputs().REASON)).toContain('did not succeed on: iOS');
        expect(String(outputs().REASON)).toContain(RUN_URL);
    });

    test('flags a build failure whose upload was therefore skipped', async () => {
        mockListJobs.mockResolvedValue(
            stagingDeployJobs([
                [ANDROID_BUILD, 'failure'],
                [ANDROID_UPLOAD, 'skipped'],
            ]),
        );

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(false);
        expect(String(outputs().REASON)).toContain('did not succeed on: Android');
    });

    test('reports every failed platform, not just the first', async () => {
        mockListJobs.mockResolvedValue(
            stagingDeployJobs([
                [ANDROID_UPLOAD, 'failure'],
                [IOS_BUILD, 'failure'],
                [IOS_UPLOAD, 'skipped'],
            ]),
        );

        await run();

        expect(String(outputs().REASON)).toContain('did not succeed on: Android, iOS');
    });

    test('treats a cancelled upload as a failure', async () => {
        mockListJobs.mockResolvedValue(stagingDeployJobs([[ANDROID_UPLOAD, 'cancelled']]));

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(false);
        expect(String(outputs().REASON)).toContain('did not succeed on: Android');
    });

    // continue-on-error spares the run but still leaves these jobs with `conclusion: failure`.
    test('ignores a failed web deploy and the continue-on-error uploads', async () => {
        mockListJobs.mockResolvedValue(
            stagingDeployJobs([
                ['Deploy Web to S3', 'failure'],
                ['Upload iOS to BrowserStack', 'failure'],
                ['Upload Android to Applause', 'failure'],
            ]),
        );

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(true);
    });

    // An unfinished deploy reports its jobs with a null conclusion, which is not success.
    test('blocks while the staging deploy is still running', async () => {
        mockListJobs.mockResolvedValue(
            stagingDeployJobs([
                [ANDROID_UPLOAD, null],
                [IOS_UPLOAD, null],
            ]),
        );

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(false);
        expect(String(outputs().REASON)).toContain('did not succeed on: Android, iOS');
    });

    test('blocks when no deploy run exists for the tag', async () => {
        mockListWorkflowRuns.mockResolvedValue(createMock<ListWorkflowRunsResponse>({data: {workflow_runs: []}}));

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(false);
    });

    test('blocks when an expected native job is missing from the run', async () => {
        mockListJobs.mockResolvedValue(
            createMock<ListJobsResponse>({
                data: {jobs: stagingDeployJobs().data.jobs.filter((job) => job.name !== IOS_UPLOAD)},
            }),
        );

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(false);
        expect(String(outputs().REASON)).toContain(IOS_UPLOAD);
    });

    test('blocks when the tag does not exist yet', async () => {
        mockGetRef.mockRejectedValue(new Error('Not Found'));

        await run();

        expect(outputs().ALL_NATIVE_BUILDS_SUCCEEDED).toBe(false);
    });
});
