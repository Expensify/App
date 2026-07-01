/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import run from '../../.github/actions/javascript/hasProductionRelease/hasProductionRelease';
import CONST from '../../.github/libs/CONST';
import * as DeployChecklistUtils from '../../.github/libs/DeployChecklistUtils';
import GithubUtils from '../../.github/libs/GithubUtils';

jest.mock('../../.github/libs/DeployChecklistUtils', () => {
    const actual = jest.requireActual('../../.github/libs/DeployChecklistUtils') as unknown as typeof DeployChecklistUtils;
    return {
        ...actual,
        getLastClosedDeployChecklist: jest.fn(),
    };
});

const mockGetLastClosedDeployChecklist = DeployChecklistUtils.getLastClosedDeployChecklist as jest.MockedFunction<typeof DeployChecklistUtils.getLastClosedDeployChecklist>;

beforeAll(() => {
    process.env.INPUT_GITHUB_TOKEN = 'fake_token';
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(() => {
    delete process.env.INPUT_GITHUB_TOKEN;
});

describe('hasProductionRelease', () => {
    test('no closed checklist yet → fail open with HAS_PRODUCTION_RELEASE true', async () => {
        mockGetLastClosedDeployChecklist.mockResolvedValue(null);
        const setOutputMock = jest.spyOn(core, 'setOutput');
        const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});

        await run();

        expect(setOutputMock).toHaveBeenCalledWith('HAS_PRODUCTION_RELEASE', true);
        expect(setFailedMock).not.toHaveBeenCalled();
    });

    test('checklist without version → setFailed', async () => {
        mockGetLastClosedDeployChecklist.mockResolvedValue({
            version: '',
        } as Awaited<ReturnType<typeof DeployChecklistUtils.getLastClosedDeployChecklist>>);
        const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation(() => {});

        await run();

        expect(setFailedMock).toHaveBeenCalledWith('Could not extract version from the most recently closed deploy checklist');
    });

    test('non-prerelease production release → HAS_PRODUCTION_RELEASE true', async () => {
        mockGetLastClosedDeployChecklist.mockResolvedValue({
            version: '1.0.2-48',
        } as Awaited<ReturnType<typeof DeployChecklistUtils.getLastClosedDeployChecklist>>);
        jest.spyOn(GithubUtils.octokit.repos, 'getReleaseByTag').mockResolvedValue({data: {prerelease: false}} as Awaited<ReturnType<typeof GithubUtils.octokit.repos.getReleaseByTag>>);
        const setOutputMock = jest.spyOn(core, 'setOutput');

        await run();

        expect(GithubUtils.octokit.repos.getReleaseByTag).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            tag: '1.0.2-48',
        });
        expect(setOutputMock).toHaveBeenCalledWith('HAS_PRODUCTION_RELEASE', true);
    });

    test('staging pre-release only → HAS_PRODUCTION_RELEASE false', async () => {
        mockGetLastClosedDeployChecklist.mockResolvedValue({
            version: '1.0.2-48',
        } as Awaited<ReturnType<typeof DeployChecklistUtils.getLastClosedDeployChecklist>>);
        jest.spyOn(GithubUtils.octokit.repos, 'getReleaseByTag').mockResolvedValue({data: {prerelease: true}} as Awaited<ReturnType<typeof GithubUtils.octokit.repos.getReleaseByTag>>);
        const setOutputMock = jest.spyOn(core, 'setOutput');

        await run();

        expect(setOutputMock).toHaveBeenCalledWith('HAS_PRODUCTION_RELEASE', false);
    });

    test('duck-typed 404 from getReleaseByTag → HAS_PRODUCTION_RELEASE false', async () => {
        mockGetLastClosedDeployChecklist.mockResolvedValue({
            version: '1.0.2-48',
        } as Awaited<ReturnType<typeof DeployChecklistUtils.getLastClosedDeployChecklist>>);
        jest.spyOn(GithubUtils.octokit.repos, 'getReleaseByTag').mockRejectedValue({status: 404});
        const setOutputMock = jest.spyOn(core, 'setOutput');

        await run();

        expect(setOutputMock).toHaveBeenCalledWith('HAS_PRODUCTION_RELEASE', false);
    });

    test('non-404 API error → rethrows', async () => {
        mockGetLastClosedDeployChecklist.mockResolvedValue({
            version: '1.0.2-48',
        } as Awaited<ReturnType<typeof DeployChecklistUtils.getLastClosedDeployChecklist>>);
        const apiError = {status: 503};
        jest.spyOn(GithubUtils.octokit.repos, 'getReleaseByTag').mockRejectedValue(apiError);

        await expect(run()).rejects.toEqual(apiError);
    });
});
