/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {context} from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

type CoverageSummary = {
    total: {
        lines: {total: number; covered: number; skipped: number; pct: number};
        statements: {total: number; covered: number; skipped: number; pct: number};
        functions: {total: number; covered: number; skipped: number; pct: number};
        branches: {total: number; covered: number; skipped: number; pct: number};
    };
    [filePath: string]: {
        lines: {total: number; covered: number; skipped: number; pct: number};
        statements: {total: number; covered: number; skipped: number; pct: number};
        functions: {total: number; covered: number; skipped: number; pct: number};
        branches: {total: number; covered: number; skipped: number; pct: number};
    };
};

type CoverageData = {
    overall: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
    };
    changedFiles: Array<{
        file: string;
        coverage: number;
        lines: string;
        branches: string;
    }>;
    baseCoverage?: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
    };
};

const COVERAGE_SECTION_START = '## Test Coverage';
const COVERAGE_SECTION_END = '<!-- END_COVERAGE_SECTION -->';

/**
 * Get list of changed files in the PR
 */
async function getChangedFiles(prNumber: number): Promise<string[]> {
    try {
        const response = await GithubUtils.octokit.pulls.listFiles({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
            per_page: 100,
        });

        return response.data.filter((file) => file.filename.match(/\.(ts|tsx|js|jsx)$/)).map((file) => file.filename);
    } catch (error) {
        console.error('Error getting changed files:', error);
        return [];
    }
}

/**
 * Parse Jest coverage summary
 */
function parseCoverageSummary(coveragePath: string): CoverageSummary | null {
    try {
        const summaryPath = path.join(coveragePath, 'coverage-summary.json');
        if (!fs.existsSync(summaryPath)) {
            console.log(`Coverage summary not found at ${summaryPath}`);
            return null;
        }

        const data = fs.readFileSync(summaryPath, 'utf8');
        return JSON.parse(data) as CoverageSummary;
    } catch (error) {
        console.error('Error parsing coverage summary:', error);
        return null;
    }
}

/**
 * Generate coverage data for changed files
 */
function generateCoverageData(coverage: CoverageSummary, changedFiles: string[], baseCoverage?: CoverageSummary): CoverageData {
    const overall = {
        statements: coverage.total.statements.pct,
        branches: coverage.total.branches.pct,
        functions: coverage.total.functions.pct,
        lines: coverage.total.lines.pct,
    };

    const changedFilesData = changedFiles
        .map((file) => {
            // Try to find coverage data for this file - first try exact match
            let fileCoverage = coverage[file];
            // If not found, try to find by matching the end of the path
            if (!fileCoverage) {
                const coverageKeys = Object.keys(coverage).filter((key) => key !== 'total');
                const matchingKey = coverageKeys.find((key) => key.endsWith(file) || key.endsWith(file.replace(/^src\//, '')));
                if (matchingKey) {
                    fileCoverage = coverage[matchingKey];
                }
            }
            return fileCoverage
                ? {
                      file,
                      coverage: fileCoverage.lines.pct,
                      lines: `${fileCoverage.lines.covered}/${fileCoverage.lines.total}`,
                      branches: `${fileCoverage.branches.covered}/${fileCoverage.branches.total}`,
                  }
                : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.coverage - a.coverage);

    const result: CoverageData = {
        overall,
        changedFiles: changedFilesData,
    };

    if (baseCoverage) {
        result.baseCoverage = {
            statements: baseCoverage.total.statements.pct,
            branches: baseCoverage.total.branches.pct,
            functions: baseCoverage.total.functions.pct,
            lines: baseCoverage.total.lines.pct,
        };
    }

    return result;
}

/**
 * Generate coverage section markdown
 */
function generateCoverageSection(coverageData: CoverageData, artifactUrl: string, workflowRunId: string): string {
    const {overall, changedFiles, baseCoverage} = coverageData;
    // Generate comparison text
    const getComparisonText = (current: number, base?: number): string => {
        if (!base) {
            return `${current.toFixed(2)}%`;
        }
        const diff = current - base;
        if (Math.abs(diff) < 0.01) {
            return `${current.toFixed(2)}%`;
        }
        const sign = diff > 0 ? '+' : '';
        const emoji = diff > 0 ? '📈' : '📉';
        return `${current.toFixed(2)}% (${emoji} ${sign}${diff.toFixed(2)}%)`;
    };

    let coverageSection = `${COVERAGE_SECTION_START}\n`;
    coverageSection += `📊 **Overall Coverage**: ${getComparisonText(overall.lines, baseCoverage?.lines)}\n`;

    if (changedFiles.length > 0) {
        const avgChangedCoverage = changedFiles.reduce((sum, file) => sum + file.coverage, 0) / changedFiles.length;
        coverageSection += `📈 **Changed Files**: ${avgChangedCoverage.toFixed(1)}% average coverage\n`;
    }

    coverageSection += '\n<details>\n<summary>📋 Coverage Details</summary>\n\n';

    if (changedFiles.length > 0) {
        coverageSection += '| File | Coverage | Lines | Branches |\n';
        coverageSection += '|------|----------|-------|----------|\n';

        changedFiles.forEach((file) => {
            const displayFile = file.file.length > 50 ? `...${file.file.slice(-47)}` : file.file;
            coverageSection += `| \`${displayFile}\` | ${file.coverage.toFixed(1)}% | ${file.lines} | ${file.branches} |\n`;
        });
    } else {
        coverageSection += '*No changed files with coverage data found.*\n';
    }

    coverageSection += '\n### Overall Coverage Summary\n';
    coverageSection += `- **Lines**: ${getComparisonText(overall.lines, baseCoverage?.lines)}\n`;
    coverageSection += `- **Statements**: ${getComparisonText(overall.statements, baseCoverage?.statements)}\n`;
    coverageSection += `- **Functions**: ${getComparisonText(overall.functions, baseCoverage?.functions)}\n`;
    coverageSection += `- **Branches**: ${getComparisonText(overall.branches, baseCoverage?.branches)}\n`;

    coverageSection += `\n📄 [View Full Coverage Report](${artifactUrl})\n`;
    coverageSection += `🔗 [View Workflow Run](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId})\n`;
    coverageSection += '\n</details>\n';
    coverageSection += `${COVERAGE_SECTION_END}\n`;

    return coverageSection;
}

/**
 * Update PR description with coverage section
 */
async function updatePRDescription(prNumber: number, coverageSection: string): Promise<void> {
    try {
        // Get current PR details
        const {data: pr} = await GithubUtils.octokit.pulls.get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
        });

        let body = pr.body ?? '';
        // Remove existing coverage section if present
        const startIndex = body.indexOf(COVERAGE_SECTION_START);
        const endIndex = body.indexOf(COVERAGE_SECTION_END);

        if (startIndex !== -1 && endIndex !== -1) {
            body = body.substring(0, startIndex) + body.substring(endIndex + COVERAGE_SECTION_END.length);
        }

        // Update PR description
        await GithubUtils.octokit.pulls.update({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
            body: `${body.trim()}\n\n${coverageSection}`,
        });

        console.log(`Successfully updated PR #${prNumber} description with coverage information`);
    } catch (error) {
        console.error('Error updating PR description:', error);
        throw error;
    }
}

/**
 * Get artifact download URL
 */
function getArtifactUrl(artifactName: string, workflowRunId: string): string {
    return `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId}/artifacts`;
}

/**
 * Main function
 */
async function run(): Promise<void> {
    try {
        const prNumber = parseInt(core.getInput('PR_NUMBER', {required: true}), 10);
        const coverageArtifactName = core.getInput('COVERAGE_ARTIFACT_NAME', {required: false}) || 'coverage-report';
        const baseCoveragePath = core.getInput('BASE_COVERAGE_PATH', {required: false});

        console.log(`Processing test coverage for PR #${prNumber}`);

        // Get changed files
        const changedFiles = await getChangedFiles(prNumber);
        console.log(`Found ${changedFiles.length} changed files`);

        // Parse coverage data
        const coveragePath = './coverage';
        const coverage = parseCoverageSummary(coveragePath);

        if (!coverage) {
            console.log('No coverage data found, skipping coverage update');
            return;
        }

        // Parse base coverage if provided
        let baseCoverage: CoverageSummary | undefined;
        if (baseCoveragePath && fs.existsSync(baseCoveragePath)) {
            baseCoverage = parseCoverageSummary(baseCoveragePath) ?? undefined;
        }

        // Generate coverage data
        const coverageData = generateCoverageData(coverage, changedFiles, baseCoverage);

        // Generate artifact URL
        const workflowRunId = context.runId.toString();
        const artifactUrl = getArtifactUrl(coverageArtifactName, workflowRunId);

        // Generate coverage section
        const coverageSection = generateCoverageSection(coverageData, artifactUrl, workflowRunId);

        // Update PR description
        await updatePRDescription(prNumber, coverageSection);

        // Set outputs
        core.setOutput('coverage-summary', JSON.stringify(coverageData.overall));
        core.setOutput('coverage-changed', changedFiles.length > 0);

        console.log('Test coverage comment posted successfully');
    } catch (error) {
        console.error('Error in postTestCoverageComment:', error);
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

if (require.main === module) {
    run();
}

export default run;
