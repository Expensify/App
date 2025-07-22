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
 * Generate coverage status emoji and text based on comparison with baseline
 */
function getCoverageStatus(current: number, base?: number): {emoji: string; status: string; diff: number} {
    if (!base) {
        return {emoji: '📊', status: 'Overall Coverage', diff: 0};
    }
    const diff = current - base;
    if (Math.abs(diff) < 0.01) {
        return {emoji: '📊', status: 'Overall Coverage', diff: 0};
    }
    if (diff > 0) {
        return {emoji: '🟢', status: 'Coverage up!', diff};
    }
    return {emoji: '🔴', status: 'Coverage dropped!', diff};
}

/**
 * Generate enhanced coverage section markdown with better formatting
 */
function generateCoverageSection(coverageData: CoverageData, artifactUrl: string, workflowRunId: string): string {
    const {overall, changedFiles, baseCoverage} = coverageData;

    // Get coverage status for overall lines coverage
    const coverageStatus = getCoverageStatus(overall.lines, baseCoverage?.lines);

    let coverageSection = '';

    // Enhanced header with status - using both diff-style and emoji format
    if (baseCoverage) {
        // Diff-style format at the top
        if (coverageStatus.diff !== 0) {
            const diffPrefix = coverageStatus.diff > 0 ? '+' : '-';
            coverageSection += '```diff\n';
            coverageSection += `${diffPrefix} 📊 Overall Coverage: ${overall.lines.toFixed(2)}% ${coverageStatus.diff > 0 ? '↑' : '↓'} (baseline: ${baseCoverage.lines.toFixed(2)}%)\n`;
            coverageSection += '```\n\n';
        }

        // Emoji-style format below
        coverageSection += `${coverageStatus.emoji} **${coverageStatus.status}**\n`;
        if (coverageStatus.diff !== 0) {
            const arrow = coverageStatus.diff > 0 ? '↑' : '↓';
            const gain = coverageStatus.diff > 0 ? 'gain' : 'drop';
            coverageSection += `📈 Overall Coverage: ${overall.lines.toFixed(1)}% ${arrow}\n`;
            coverageSection += `${coverageStatus.diff > 0 ? '🚀' : '⚠️'} ${Math.abs(coverageStatus.diff).toFixed(1)}% ${gain} from baseline\n`;
        } else {
            coverageSection += `📊 Overall Coverage: ${overall.lines.toFixed(1)}% (unchanged)\n`;
        }
    } else {
        coverageSection += `📊 **Overall Coverage**: ${overall.lines.toFixed(1)}%\n`;
    }

    // Changed files summary
    if (changedFiles.length > 0) {
        const avgChangedCoverage = changedFiles.reduce((sum, file) => sum + file.coverage, 0) / changedFiles.length;
        coverageSection += `📈 **Changed Files**: ${avgChangedCoverage.toFixed(1)}% average coverage\n`;
    }

    // Details section
    coverageSection += '\n<details>\n<summary>📋 Coverage Details</summary>\n\n';

    // Changed files table
    if (changedFiles.length > 0) {
        coverageSection += '| File | Coverage | Lines | Branches |\n';
        coverageSection += '|------|----------|-------|----------|\n';

        changedFiles.forEach((file) => {
            const displayFile = file.file.length > 50 ? `...${file.file.slice(-47)}` : file.file;
            coverageSection += `| \`${displayFile}\` | ${file.coverage.toFixed(1)}% | ${file.lines} | ${file.branches} |\n`;
        });
        coverageSection += '\n';
    } else {
        coverageSection += '*No changed files with coverage data found.*\n\n';
    }

    // Overall coverage summary with comparisons
    coverageSection += '### Overall Coverage Summary\n';

    const formatMetric = (name: string, current: number, base?: number): string => {
        if (!base) {
            return `- **${name}**: ${current.toFixed(2)}%`;
        }
        const diff = current - base;
        if (Math.abs(diff) < 0.01) {
            return `- **${name}**: ${current.toFixed(2)}%`;
        }
        const sign = diff > 0 ? '+' : '';
        const emoji = diff > 0 ? '📈' : '📉';
        return `- **${name}**: ${current.toFixed(2)}% (${emoji} ${sign}${diff.toFixed(2)}%)`;
    };

    coverageSection += `${formatMetric('Lines', overall.lines, baseCoverage?.lines)}\n`;
    coverageSection += `${formatMetric('Statements', overall.statements, baseCoverage?.statements)}\n`;
    coverageSection += `${formatMetric('Functions', overall.functions, baseCoverage?.functions)}\n`;
    coverageSection += `${formatMetric('Branches', overall.branches, baseCoverage?.branches)}\n`;

    // Links section
    coverageSection += '\n</details>\n\n';
    coverageSection += `📄 [View Full Coverage Report](${artifactUrl})\n`;
    coverageSection += `🔗 [View Workflow Run](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId})\n`;
    coverageSection += `\n${COVERAGE_SECTION_END}`;

    return coverageSection;
}

/**
 * Update PR body with coverage information
 */
async function updatePRBody(prNumber: number, coverageSection: string): Promise<void> {
    try {
        // Get current PR data
        const prResponse = await GithubUtils.octokit.pulls.get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
        });

        const currentBody = prResponse.data.body ?? '';

        // Check if coverage section already exists
        const coverageStartIndex = currentBody.indexOf('<!-- START_COVERAGE_SECTION -->');
        const coverageEndIndex = currentBody.indexOf(COVERAGE_SECTION_END);

        let newBody: string;
        if (coverageStartIndex !== -1 && coverageEndIndex !== -1) {
            // Replace existing coverage section
            const beforeCoverage = currentBody.substring(0, coverageStartIndex);
            const afterCoverage = currentBody.substring(coverageEndIndex + COVERAGE_SECTION_END.length);
            newBody = `${beforeCoverage}\n<!-- START_COVERAGE_SECTION -->\n${coverageSection}\n${afterCoverage}`;
        } else {
            // Add coverage section at the end
            const separator = currentBody.trim() ? '\n\n---\n\n' : '';
            newBody = `${currentBody + separator}\n<!-- START_COVERAGE_SECTION -->\n${coverageSection}`;
        }

        // Update PR body
        await GithubUtils.octokit.pulls.update({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
            body: newBody,
        });

        console.log(`Successfully updated PR #${prNumber} body with coverage information`);
    } catch (error) {
        console.error('Error updating PR body:', error);
        throw error;
    }
}

/**
 * Get coverage report URL - either from direct input or fallback to workflow artifacts
 */
function getCoverageUrl(coverageUrl: string, artifactName: string, workflowRunId: string): string {
    // If we have a direct URL (e.g., from Surge.sh), use it
    if (coverageUrl) {
        return coverageUrl;
    }

    // Fallback to workflow run artifacts page
    return `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId}`;
}

/**
 * Main function
 */
async function run(): Promise<void> {
    try {
        const osBotifyToken = core.getInput('OS_BOTIFY_TOKEN', {required: true});
        GithubUtils.initOctokitWithToken(osBotifyToken);

        const prNumber = parseInt(core.getInput('PR_NUMBER', {required: true}), 10);
        const coverageArtifactName = core.getInput('COVERAGE_ARTIFACT_NAME', {required: false}) || 'coverage-report';
        const baseCoveragePath = core.getInput('BASE_COVERAGE_PATH', {required: false});
        const coverageUrl = core.getInput('COVERAGE_URL', {required: false});

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

        // Get coverage URL
        const workflowRunId = context.runId.toString();
        const reportUrl = getCoverageUrl(coverageUrl, coverageArtifactName, workflowRunId);

        // Generate coverage section
        const coverageSection = generateCoverageSection(coverageData, reportUrl, workflowRunId);

        // Update PR body with coverage information
        await updatePRBody(prNumber, coverageSection);

        // Set outputs
        core.setOutput('coverage-summary', JSON.stringify(coverageData.overall));
        core.setOutput('coverage-changed', changedFiles.length > 0);

        console.log('Test coverage information added to PR body successfully');
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
