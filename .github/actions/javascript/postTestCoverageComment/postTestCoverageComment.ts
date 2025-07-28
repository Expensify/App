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
    }>;
    baseCoverage?: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
    };
};

type TemplateData = {
    hasBaseline: boolean;
    hasChangedFiles: boolean;
    avgChangedCoverage: string | number;
    current: {
        lines: string;
        functions: string;
        statements: string;
    };
    baseline: {
        lines: string;
        functions: string;
        statements: string;
    } | null;
    status: {
        emoji: string;
        text: string;
        hasChange: boolean;
        isIncrease: boolean;
        isDecrease: boolean;
        arrow: string;
        changeEmoji: string;
        changeText: string;
    };
    changes: {
        lines: string;
        statements: string;
        functions: string;
    };
    changedFiles: Array<{
        displayFile: string;
        coverage: string;
        file: string;
        lines: string;
    }>;
    links: {
        coverageReport: string;
        workflowRun: string;
    };
}

const COVERAGE_SECTION_START = '<!-- START_COVERAGE_SECTION -->';
const COVERAGE_SECTION_END = '<!-- END_COVERAGE_SECTION -->';
const COVERAGE_SECTION_HEADER = `## 📊 Test Coverage Report`;

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
        branches: coverage.total.branches?.pct,
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
 * Simple mustache-like template engine
 */
function renderTemplate(template: string, data: TemplateData) {
    let result = template;

    // Handle array iterations FIRST (before conditional blocks to avoid conflicts)
    result = result.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, arrayName, content) => {
        const array = getNestedValue(data, arrayName as string);
        if (Array.isArray(array)) {
            return array.map((item) => renderTemplate(content as string, {...data, ...item} as TemplateData)).join('');
        }
        // If not an array, treat as conditional block
        const value = getNestedValue(data, arrayName as string);
        return value ? renderTemplate(content as string, data) : '';
    });

    // Handle inverted conditional blocks {{^condition}} ... {{/condition}}
    result = result.replace(/\{\{\^([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, condition, content) => {
        const value = getNestedValue(data, condition as string);
        return !value ? renderTemplate(content as string, data) : '';
    });

    // Handle variable substitutions {{variable}}
    result = result.replace(/\{\{([^}#^/]+)\}\}/g, (match, variable: string) => {
        const value = getNestedValue(data, variable?.trim());
        return String(value) ?? '';
    });

    return result;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: TemplateData, nestPath: string) {
    return nestPath.split('.').reduce((current: unknown, key: string) => {
        return (current as Record<string, unknown>)?.[key] as string;
    }, obj);
}

/**
 * Generate coverage status emoji and text based on comparison with baseline
 */
function getCoverageStatus(current: number, baseline?: number): {emoji: string; status: string; diff: number} {
    const diff = current - (baseline ?? 0);
    if (!baseline || Math.abs(diff) < 0.01) {
        return {emoji: '', status: '', diff: 0};
    }
    if (diff > 0) {
        return {emoji: '🟢', status: 'Coverage up', diff};
    }
    return {emoji: '🔴', status: 'Coverage dropped', diff};
}

/**
 * Calculate coverage change with formatting
 */
function calculateChange(current: number, baseline: number): string {
    const diff = current - baseline;
    if (!baseline || Math.abs(diff) < 0.01) {
        return '0.0%';
    }
    // Negative sign is already handled by the diff calculation
    return `${diff > 0 ? '+' : ''}${diff?.toFixed(1)}%`;
}

/**
 * Generate enhanced coverage section markdown with better formatting
 */
function generateCoverageSection(coverageData: CoverageData, artifactUrl: string, workflowRunId: string): string {
    const {overall, changedFiles, baseCoverage} = coverageData;

    // Local template for easy editing
    const coverageTemplate = `${COVERAGE_SECTION_HEADER}

{{#status.hasChange}}### {{status.emoji}} **{{status.text}}**{{/status.hasChange}}
{{#hasBaseline}}{{#status.hasChange}}
\`\`\`diff
{{#status.isIncrease}}+ 📈 Overall Coverage: ↑ {{current.lines}}% (main: {{baseline.lines}}%){{/status.isIncrease}}{{#status.isDecrease}}- 📉 Overall Coverage: ↓ {{current.lines}}% (main: {{baseline.lines}}%){{/status.isDecrease}}
\`\`\`
{{/status.hasChange}}{{/hasBaseline}}{{#status.hasChange}}
> {{#status.isIncrease}}[!TIP]{{/status.isIncrease}}{{#status.isDecrease}}[!CAUTION]{{/status.isDecrease}}
> {{status.changeEmoji}} **{{status.changeText}}**
{{/status.hasChange}}{{^status.hasChange}}{{#hasBaseline}}
\`\`\`diff
🔁 Overall Coverage: {{current.lines}}% (unchanged from main)
\`\`\`
{{/hasBaseline}}{{^hasBaseline}}
\`\`\`diff
🔁 **Overall Coverage**: {{current.lines}}%
\`\`\`
{{/hasBaseline}}{{/status.hasChange}}
<details>
<summary><strong>📁 Coverage details</strong></summary>
<br>
{{#hasChangedFiles}}
| File | Coverage | Lines |
|------|----------|-------|
{{#changedFiles}}| \`{{displayFile}}\` | {{coverage}}% | {{lines}} |{{/changedFiles}}
{{/hasChangedFiles}}
{{^hasChangedFiles}}*No coverage changed files found.*{{/hasChangedFiles}}
**🔄 Overall Coverage Summary**
{{#hasBaseline}}
- **Lines**: {{current.lines}}% ({{changes.lines}})
- **Statements**: {{current.statements}}% ({{changes.statements}})
- **Functions**: {{current.functions}}% ({{changes.functions}})
{{/hasBaseline}}
{{^hasBaseline}}
- **Lines**: {{current.lines}}%
- **Statements**: {{current.statements}}%
- **Functions**: {{current.functions}}%
{{/hasBaseline}}

</details>

📄 [View Web Report]({{links.coverageReport}})
⚙️ [View Workflow Run]({{links.workflowRun}})

<!-- END_COVERAGE_SECTION -->`;

    // Get coverage status for overall lines coverage
    const coverageStatus = getCoverageStatus(overall.lines, baseCoverage?.lines);

    // Calculate changes for all metrics
    const changes = baseCoverage
        ? {
              lines: calculateChange(overall.lines, baseCoverage.lines),
              statements: calculateChange(overall.statements, baseCoverage.statements),
              functions: calculateChange(overall.functions, baseCoverage.functions),
          }
        : {};

    // Process changed files for template
    const processedChangedFiles = changedFiles.map((file) => ({
        ...file,
        displayFile: file.file.length > 50 ? `...${file.file.slice(-47)}` : file.file,
        coverage: file.coverage != null ? file.coverage.toFixed(1) : '0.0',
    }));

    const avgChangedCoverage = changedFiles.length > 0 ? (changedFiles.reduce((sum, file) => sum + file.coverage, 0) / changedFiles.length).toFixed(1) : 0;

    // Prepare template data
    const templateData = {
        hasBaseline: !!baseCoverage,
        hasChangedFiles: changedFiles.length > 0,
        avgChangedCoverage,

        current: {
            lines: overall.lines?.toFixed(1),
            functions: overall.functions?.toFixed(1),
            statements: overall.statements?.toFixed(1),
        },

        baseline: baseCoverage
            ? {
                  lines: baseCoverage.lines?.toFixed(1),
                  functions: baseCoverage.functions?.toFixed(1),
                  statements: baseCoverage.statements?.toFixed(1),
              }
            : null,

        status: {
            emoji: coverageStatus.emoji,
            text: coverageStatus.status,
            hasChange: coverageStatus.diff !== 0,
            isIncrease: coverageStatus.diff > 0,
            isDecrease: coverageStatus.diff < 0,
            arrow: coverageStatus.diff > 0 ? '↑' : '↓',
            changeEmoji: coverageStatus.diff > 0 ? '🚀' : '⚠️',
            changeText: `${Math.abs(coverageStatus.diff)?.toFixed(1)}% ${coverageStatus.diff > 0 ? 'increase' : 'decrease'} from main`,
        },

        changes,
        changedFiles: processedChangedFiles,

        links: {
            coverageReport: artifactUrl,
            workflowRun: `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${workflowRunId}`,
        },
    };

    return renderTemplate(coverageTemplate, templateData as TemplateData);
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
        const coverageStartIndex = currentBody.indexOf(COVERAGE_SECTION_START);
        const coverageEndIndex = currentBody.indexOf(COVERAGE_SECTION_END);

        let newBody: string;
        if (coverageStartIndex !== -1 && coverageEndIndex !== -1) {
            // Replace existing coverage section
            const beforeCoverage = currentBody.substring(0, coverageStartIndex);
            const afterCoverage = currentBody.substring(coverageEndIndex + COVERAGE_SECTION_END.length);
            newBody = `${beforeCoverage}${COVERAGE_SECTION_START}\n${coverageSection}${afterCoverage}`;
        } else {
            // Add coverage section at the end of the PR body
            newBody = `${currentBody}\n\n${COVERAGE_SECTION_START}\n${coverageSection}`;
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
function getCoverageUrl(coverageUrl: string, workflowRunId: string): string {
    // If we have a direct URL (e.g., from S3), use it
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
        const reportUrl = getCoverageUrl(coverageUrl, workflowRunId);

        // Generate coverage section
        const coverageSection = generateCoverageSection(coverageData, reportUrl, workflowRunId);

        // Update PR body with coverage information
        await updatePRBody(prNumber, coverageSection);

        // Add coverage information to GitHub Job Summary (displays on workflow run page)
        await core.summary
            .addHeading(`📊 Test Coverage Report for PR #${prNumber}`, 2)
            .addRaw(coverageSection.replace(COVERAGE_SECTION_HEADER, ''))
            .addSeparator()
            .addRaw('💡 This summary is also available at the end of the PR description.')
            .write();

        // Set outputs
        core.setOutput('coverage-summary', JSON.stringify(coverageData.overall));
        core.setOutput('coverage-changed', changedFiles.length > 0);

        console.log('Test coverage information added to PR body and workflow summary successfully');
    } catch (error) {
        console.error('Error in postTestCoverageComment:', error);
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

// Run the action
run();

export default run;
