/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import {execSync} from 'child_process';
import * as fs from 'fs';
import {when} from 'jest-when';
import * as path from 'path';
import ghAction from '@github/actions/javascript/postTestCoverageComment/postTestCoverageComment';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import asMutable from '@src/types/utils/asMutable';

const mockGetInput = jest.fn();
const mockListFiles = jest.fn();
const mockListComments = jest.fn();
const mockCreateComment = jest.fn();
const mockUpdateComment = jest.fn();

jest.spyOn(GithubUtils, 'octokit', 'get').mockReturnValue({
    pulls: {
        listFiles: mockListFiles as unknown as typeof GithubUtils.octokit.pulls.listFiles,
    },
    issues: {
        listComments: mockListComments as unknown as typeof GithubUtils.octokit.issues.listComments,
        createComment: mockCreateComment as unknown as typeof GithubUtils.octokit.issues.createComment,
        updateComment: mockUpdateComment as unknown as typeof GithubUtils.octokit.issues.updateComment,
    },
} as RestEndpointMethods);

jest.mock('@actions/github', () => ({
    context: {
        repo: {
            owner: 'Expensify',
            repo: 'App',
        },
        runId: 12345,
    },
}));

const generateRealCoverageData = (): void => {
    const coverageCommand = `
        npx jest \
            --coverage \
            --coverageDirectory=coverage \
            --collectCoverageFrom='src/libs/TransactionUtils/index.ts' \
            --collectCoverageFrom='!src/**/*.d.ts' \
            --collectCoverageFrom='!src/**/*.stories.tsx' \
            --collectCoverageFrom='!src/**/*.test.{ts,tsx,js,jsx}' \
            --collectCoverageFrom='!src/**/*.spec.{ts,tsx,js,jsx}' \
            --collectCoverageFrom='!src/**/__tests__/**' \
            --collectCoverageFrom='!src/**/__mocks__/**' \
            --coverageReporters=json-summary \
            --coverageReporters=lcov \
            --coverageReporters=html \
            --coverageReporters=text-summary \
            --maxWorkers=2 \
            --testTimeout=30000 \
            --testPathPattern='tests/unit/AddUnreportedExpenseTest.ts' \
            --silent
    `;

    execSync(coverageCommand.replace(/\s+/g, ' ').trim(), {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_OPTIONS: '--experimental-vm-modules',
            CI: 'true',
        },
    });
};

const mockChangedFiles = [
    {
        filename: 'src/libs/TransactionUtils/index.ts',
        status: 'modified',
        additions: 10,
        deletions: 2,
        changes: 12,
    },
];

describe('Post test coverage comment action tests', () => {
    beforeAll(() => {
        asMutable(core).getInput = mockGetInput;
        generateRealCoverageData();
    });

    afterAll(() => {
        if (fs.existsSync('coverage')) {
            fs.rmSync('coverage', {recursive: true, force: true});
        }

        if (fs.existsSync('baseline-coverage')) {
            fs.rmSync('baseline-coverage', {recursive: true, force: true});
        }

        if (fs.existsSync('coverage.backup')) {
            fs.rmSync('coverage.backup', {recursive: true, force: true});
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockListFiles.mockResolvedValue({
            data: mockChangedFiles,
        });
        mockListComments.mockResolvedValue({
            data: [], // No existing coverage comments by default
        });
        mockCreateComment.mockResolvedValue({} as never);
        mockUpdateComment.mockResolvedValue({} as never);
    });

    test('Test coverage comment generation with changed files', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('COVERAGE_ARTIFACT_NAME', {required: false}).mockReturnValue('coverage-report');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');

        await ghAction();

        expect(mockListFiles).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: 123,
            per_page: 100,
        });

        expect(mockListComments).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            issue_number: 123,
        });

        expect(mockCreateComment).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            issue_number: 123,
            body: expect.stringContaining('📊 **Overall Coverage**: 3.7%') as string,
        });

        // Check that the coverage comment is properly formatted
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const createCall = mockCreateComment.mock.calls.at(0)?.at(0) as {body: string};
        expect(createCall.body).toContain('📊 **Overall Coverage**: 3.7%');
        expect(createCall.body).toContain('📈 **Changed Files**: 3.7% average coverage');
        expect(createCall.body).toContain('src/libs/TransactionUtils/index.ts');
        expect(createCall.body).toContain('3.7% | 20/535 | 5/709');
        expect(createCall.body).toContain('<!-- END_COVERAGE_SECTION -->');
    });

    test('Test coverage comment with no changed files', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('COVERAGE_ARTIFACT_NAME', {required: false}).mockReturnValue('coverage-report');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');

        // Mock no changed files
        mockListFiles.mockResolvedValue({
            data: [],
        });

        await ghAction();

        expect(mockCreateComment).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            issue_number: 123,
            body: expect.stringContaining('*No changed files with coverage data found.*') as string,
        });
    });

    test('Test coverage comment with baseline comparison', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('COVERAGE_ARTIFACT_NAME', {required: false}).mockReturnValue('coverage-report');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('./baseline-coverage');

        // Mock baseline coverage (higher than current)
        const baselineCoverage = {
            total: {
                lines: {total: 535, covered: 30, skipped: 0, pct: 5.61},
                statements: {total: 565, covered: 32, skipped: 0, pct: 5.66},
                functions: {total: 169, covered: 8, skipped: 0, pct: 4.73},
                branches: {total: 709, covered: 10, skipped: 0, pct: 1.41},
            },
        };

        // Create temporary baseline directory and file
        const baselineDir = './baseline-coverage';
        const baselineFile = path.join(baselineDir, 'coverage-summary.json');

        if (!fs.existsSync(baselineDir)) {
            fs.mkdirSync(baselineDir, {recursive: true});
        }
        fs.writeFileSync(baselineFile, JSON.stringify(baselineCoverage));

        try {
            await ghAction();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const createCall = mockCreateComment.mock.calls.at(0)?.at(0) as {body: string};
            // Check for diff-style format
            expect(createCall.body).toContain('```diff');
            expect(createCall.body).toContain('↓ (baseline:');
            // Check for emoji-style format
            expect(createCall.body).toContain('🔴 **Coverage dropped!**');
            expect(createCall.body).toContain('⚠️');
            expect(createCall.body).toContain('drop from baseline');
        } finally {
            // Clean up baseline directory
            if (fs.existsSync(baselineFile)) {
                fs.unlinkSync(baselineFile);
            }
            if (fs.existsSync(baselineDir)) {
                fs.rmdirSync(baselineDir);
            }
        }
    });

    test('Test coverage comment updates existing coverage comment', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('COVERAGE_ARTIFACT_NAME', {required: false}).mockReturnValue('coverage-report');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');

        // Mock existing coverage comment
        mockListComments.mockResolvedValue({
            data: [
                {
                    id: 456789,
                    user: {login: 'github-actions[bot]'},
                    body: 'Old coverage information here\n<!-- END_COVERAGE_SECTION -->',
                },
            ],
        });

        await ghAction();

        expect(mockUpdateComment).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            comment_id: 456789,
            body: expect.stringContaining('📊 **Overall Coverage**: 3.7%') as string,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const updateCall = mockUpdateComment.mock.calls.at(0)?.at(0) as {body: string};
        expect(updateCall.body).not.toContain('Old coverage information here');
        expect(updateCall.body).toContain('📊 **Overall Coverage**: 3.7%');
        expect(updateCall.body).toContain('<!-- END_COVERAGE_SECTION -->');
    });

    test('Test coverage comment handles missing coverage data', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('COVERAGE_ARTIFACT_NAME', {required: false}).mockReturnValue('coverage-report');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');

        // Temporarily move the coverage file to simulate missing data
        const coverageFile = 'coverage/coverage-summary.json';
        const backupFile = 'coverage/coverage-summary.json.backup';

        if (fs.existsSync(coverageFile)) {
            fs.renameSync(coverageFile, backupFile);
        }

        try {
            await ghAction();
            // Should not create comment when no coverage data
            expect(mockCreateComment).not.toHaveBeenCalled();
            expect(mockUpdateComment).not.toHaveBeenCalled();
        } finally {
            // Restore the coverage file
            if (fs.existsSync(backupFile)) {
                fs.renameSync(backupFile, coverageFile);
            }
        }
    });

    test('Test coverage comment handles file filtering', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('COVERAGE_ARTIFACT_NAME', {required: false}).mockReturnValue('coverage-report');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');

        // Mock changed files with different extensions
        mockListFiles.mockResolvedValue({
            data: [
                {filename: 'src/libs/TransactionUtils/index.ts', status: 'modified'},
                {filename: 'README.md', status: 'modified'},
                {filename: 'src/components/Button/index.tsx', status: 'modified'},
                {filename: 'package.json', status: 'modified'},
            ],
        });

        await ghAction();

        expect(mockListFiles).toHaveBeenCalled();
        expect(mockCreateComment).toHaveBeenCalled();

        // Should only process .ts, .tsx, .js, .jsx files that have coverage data
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const createCall = mockCreateComment.mock.calls.at(0)?.at(0) as {body: string};
        expect(createCall.body).toContain('src/libs/TransactionUtils/index.ts');
        expect(createCall.body).not.toContain('README.md');
    });
});
