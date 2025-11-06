import * as core from '@actions/core';
import {context} from '@actions/github';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

/**
 * Extracts the Coverage Δ table from a CodeCov comment
 */
function extractCoverageDeltaTable(body: string): string | null {
    // Match the table that contains "Coverage Δ" - handle both markdown tables (with |) and plain text
    // The regex accounts for markdown link syntax like [Files with missing lines](url)
    const tableHeaderRegex = /[|\s]*\[?Files with missing lines\]?(?:\([^)]*\))?[|\s]*Coverage Δ[|\s]*/i;
    const tableMatch = body.match(tableHeaderRegex);

    if (!tableMatch) {
        return null;
    }

    const startIndex = tableMatch.index ?? 0;

    // Find the table by looking for the header line and extracting everything until we hit the "New features" section or two consecutive newlines
    const remainingText = body.slice(startIndex);
    const lines = remainingText.split('\n');

    const tableLines = [];
    let emptyLineCount = 0;
    let foundTableStart = false;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip lines until we find the actual table header (line starting with |)
        if (!foundTableStart) {
            if (trimmedLine.startsWith('|') && trimmedLine.includes('Coverage Δ')) {
                foundTableStart = true;
            } else {
                continue;
            }
        }

        // Stop at the "New features" section (can be emoji or <details> tag)
        if (trimmedLine.includes('🚀 New features') || trimmedLine.includes(':rocket: New features') || trimmedLine.startsWith('<details>')) {
            break;
        }

        // Track empty lines
        if (trimmedLine === '') {
            emptyLineCount++;
            // Stop if we hit 2 consecutive empty lines
            if (emptyLineCount >= 2) {
                break;
            }
            continue;
        } else {
            emptyLineCount = 0;
        }

        tableLines.push(line);
    }

    return tableLines.join('\n').trim();
}

/**
 * Checks if the comment contains any downward arrows (decreased coverage)
 */
function hasDecreasedCoverage(body: string): boolean {
    return body.includes('⬇️');
}

/**
 * Formats a CodeCov comment according to specifications
 */
function formatCodeCovComment(originalBody: string): string | null {
    // Check if this is a comment that should remain unchanged
    // "All modified and coverable lines are covered by tests" without a table
    if (originalBody.includes('✅ All modified and coverable lines are covered by tests')) {
        const hasCoverageTable = originalBody.includes('Coverage Δ');
        if (!hasCoverageTable) {
            // Leave it unchanged
            return null;
        }
    }

    // Extract the Coverage Δ table
    const coverageTable = extractCoverageDeltaTable(originalBody);

    if (!coverageTable) {
        return null;
    }

    // Determine the message based on decreased coverage
    let message: string;
    if (hasDecreasedCoverage(originalBody)) {
        message =
            "❌ Looks like you've decreased code coverage for some files. Please write tests to increase, or at least maintain, the existing level of code coverage. See our documentation [here](https://github.com/Expensify/App/blob/main/contributingGuides/CodeCov.md) for how to interpret this table.";
    } else {
        message = '✅ Changes either increased or maintained existing code coverage, great job!';
    }

    // Build the new comment body
    const newBody = `Codecov Report

${message}

${coverageTable}`;

    return newBody;
}

async function run() {
    try {
        // Check if this is a comment event
        if (context.eventName !== 'issue_comment') {
            console.log('This action only runs on issue_comment events');
            return;
        }

        const commentId = context.payload.comment?.id;
        const commentBody = context.payload.comment?.body as string | undefined;
        const commentUser = context.payload.comment?.user as {login?: string} | undefined;
        const commentAuthor = commentUser?.login;

        if (!commentBody || !commentId || typeof commentBody !== 'string') {
            console.log('No comment body or ID found');
            return;
        }

        // Check if the comment is from CodeCov (or test user)
        if (commentAuthor !== 'codecov[bot]' && commentAuthor !== 'codecov-commenter' && commentAuthor !== 'abzokhattab') {
            console.log(`Comment is not from CodeCov or test user (author: ${commentAuthor})`);
            return;
        }

        // Check if the comment starts with "Codecov Report"
        if (!commentBody.includes('Codecov Report')) {
            console.log('Comment does not appear to be a CodeCov report');
            return;
        }

        console.log('Found a CodeCov comment, formatting...');

        // Format the comment
        const formattedBody = formatCodeCovComment(commentBody);

        if (!formattedBody) {
            console.log('Comment should remain unchanged or formatting failed');
            return;
        }

        // Update the comment
        await GithubUtils.octokit.issues.updateComment({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            comment_id: commentId,
            body: formattedBody,
        });

        console.log('Successfully formatted CodeCov comment! 🎉');
    } catch (error) {
        console.error('Error formatting CodeCov comment:', error);
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

if (require.main === module) {
    run();
}

export default run;
