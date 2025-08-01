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
const mockGetPR = jest.fn();
const mockUpdatePR = jest.fn();
const mockInitOctokitWithToken = jest.fn();

jest.spyOn(GithubUtils, 'initOctokitWithToken').mockImplementation(mockInitOctokitWithToken);
jest.spyOn(GithubUtils, 'octokit', 'get').mockReturnValue({
    pulls: {
        listFiles: mockListFiles as unknown as typeof GithubUtils.octokit.pulls.listFiles,
        get: mockGetPR as unknown as typeof GithubUtils.octokit.pulls.get,
        update: mockUpdatePR as unknown as typeof GithubUtils.octokit.pulls.update,
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
        mockGetPR.mockResolvedValue({
            data: {
                body: 'Original PR description',
            },
        });
        mockUpdatePR.mockResolvedValue({} as never);
    });

    test('Test coverage comment generation with changed files', async () => {
        when(core.getInput).calledWith('OS_BOTIFY_TOKEN', {required: true}).mockReturnValue('fake-token');
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('COVERAGE_URL', {required: false}).mockReturnValue('');

        await ghAction();

        expect(mockInitOctokitWithToken).toHaveBeenCalledWith('fake-token');
        expect(mockListFiles).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: 123,
            per_page: 100,
        });

        expect(mockGetPR).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: 123,
        });

        expect(mockUpdatePR).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: 123,
            body: expect.stringContaining('## 📊 Test Coverage Report') as string,
        });

        // Check that the coverage information is properly formatted
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const updateCall = mockUpdatePR.mock.calls.at(0)?.at(0) as {body: string};
        expect(updateCall.body).toContain('## 📊 Test Coverage Report');
        expect(updateCall.body).toContain('🔁 Overall Coverage:');
        expect(updateCall.body).toContain('src/libs/TransactionUtils/index.ts');
        expect(updateCall.body).toContain('<!-- END_COVERAGE_SECTION -->');
        expect(updateCall.body).toContain('<!-- START_COVERAGE_SECTION -->');
        expect(updateCall.body).toContain('📄 [View Web Report]');
        expect(updateCall.body).toContain('⚙️ [View Workflow Run]');
    });

    test('Test coverage comment with no changed files', async () => {
        when(core.getInput).calledWith('OS_BOTIFY_TOKEN', {required: true}).mockReturnValue('fake-token');
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('COVERAGE_URL', {required: false}).mockReturnValue('');

        // Mock no changed files
        mockListFiles.mockResolvedValue({
            data: [],
        });

        await ghAction();

        expect(mockUpdatePR).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: 123,
            body: expect.stringContaining('*No coverage changed files found.*') as string,
        });
    });

    test('Test coverage comment with baseline comparison', async () => {
        when(core.getInput).calledWith('OS_BOTIFY_TOKEN', {required: true}).mockReturnValue('fake-token');
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('./baseline-coverage');
        when(core.getInput).calledWith('COVERAGE_URL', {required: false}).mockReturnValue('');

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
            const updateCall = mockUpdatePR.mock.calls.at(0)?.at(0) as {body: string};
            // Check for diff-style format with new template
            expect(updateCall.body).toContain('```diff');
            expect(updateCall.body).toContain('📉 Overall Coverage: ↓');
            expect(updateCall.body).toContain('(main:');
            // Check for status indicators
            expect(updateCall.body).toContain('🔴 **Coverage dropped**');
            expect(updateCall.body).toContain('[!CAUTION]');
            expect(updateCall.body).toContain('⚠️');
            expect(updateCall.body).toContain('decrease from main');
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

    test('Test coverage comment updates existing coverage section in PR body', async () => {
        when(core.getInput).calledWith('OS_BOTIFY_TOKEN', {required: true}).mockReturnValue('fake-token');
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('COVERAGE_URL', {required: false}).mockReturnValue('');

        // Mock existing PR body with coverage section
        mockGetPR.mockResolvedValue({
            data: {
                body: 'Original PR description\n\n<!-- START_COVERAGE_SECTION -->\nOld coverage information here\n<!-- END_COVERAGE_SECTION -->\n\nMore PR description',
            },
        });

        await ghAction();

        expect(mockUpdatePR).toHaveBeenCalledWith({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: 123,
            body: expect.stringContaining('## 📊 Test Coverage Report') as string,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const updateCall = mockUpdatePR.mock.calls.at(0)?.at(0) as {body: string};
        expect(updateCall.body).not.toContain('Old coverage information here');
        expect(updateCall.body).toContain('## 📊 Test Coverage Report');
        expect(updateCall.body).toContain('🔁 Overall Coverage:');
        expect(updateCall.body).toContain('<!-- END_COVERAGE_SECTION -->');
        expect(updateCall.body).toContain('<!-- START_COVERAGE_SECTION -->');
        expect(updateCall.body).toContain('More PR description'); // Original content should be preserved
    });

    test('Test coverage comment handles missing coverage data', async () => {
        when(core.getInput).calledWith('OS_BOTIFY_TOKEN', {required: true}).mockReturnValue('fake-token');
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('COVERAGE_URL', {required: false}).mockReturnValue('');

        // Temporarily move the coverage file to simulate missing data
        const coverageFile = 'coverage/coverage-summary.json';
        const backupFile = 'coverage/coverage-summary.json.backup';

        if (fs.existsSync(coverageFile)) {
            fs.renameSync(coverageFile, backupFile);
        }

        try {
            await ghAction();
            // Should not update PR when no coverage data
            expect(mockUpdatePR).not.toHaveBeenCalled();
        } finally {
            // Restore the coverage file
            if (fs.existsSync(backupFile)) {
                fs.renameSync(backupFile, coverageFile);
            }
        }
    });

    test('Test coverage comment handles file filtering', async () => {
        when(core.getInput).calledWith('OS_BOTIFY_TOKEN', {required: true}).mockReturnValue('fake-token');
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('123');
        when(core.getInput).calledWith('BASE_COVERAGE_PATH', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('COVERAGE_URL', {required: false}).mockReturnValue('');

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
        expect(mockUpdatePR).toHaveBeenCalled();

        // Should only process .ts, .tsx, .js, .jsx files that have coverage data
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const updateCall = mockUpdatePR.mock.calls.at(0)?.at(0) as {body: string};
        expect(updateCall.body).toContain('src/libs/TransactionUtils/index.ts');
        expect(updateCall.body).not.toContain('README.md');
    });
});
