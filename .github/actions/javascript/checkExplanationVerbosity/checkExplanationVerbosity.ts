import * as core from '@actions/core';
import * as github from '@actions/github';

const EXPLANATION_SECTION_START = '### Explanation of Change';
const EXPLANATION_SECTION_END = '### Fixed Issues';

// Chosen to only flag PRs where the explanation is long *and* the diff is mostly deletions (e.g. a revert or
// simplification), since that's the pattern where a narrated investigation is least likely to be warranted.
const WORD_COUNT_THRESHOLD = 800;
const DELETION_RATIO_THRESHOLD = 0.7;

function extractExplanationSection(body: string): string {
    const startIndex = body.indexOf(EXPLANATION_SECTION_START);
    if (startIndex === -1) {
        return '';
    }

    const endIndex = body.indexOf(EXPLANATION_SECTION_END, startIndex);
    const section = endIndex === -1 ? body.slice(startIndex + EXPLANATION_SECTION_START.length) : body.slice(startIndex + EXPLANATION_SECTION_START.length, endIndex);

    return section.replaceAll(/<!--[\s\S]*?-->/g, '').trim();
}

function countWords(text: string): number {
    if (!text) {
        return 0;
    }
    return text.split(/\s+/).filter(Boolean).length;
}

function getDeletionRatio(additions: number, deletions: number): number {
    const totalChanges = additions + deletions;
    return totalChanges === 0 ? 0 : deletions / totalChanges;
}

function run(): void {
    const pullRequest = github.context.payload.pull_request;
    const body = String(pullRequest?.body ?? '');
    const additions = Number(pullRequest?.additions ?? 0);
    const deletions = Number(pullRequest?.deletions ?? 0);

    const wordCount = countWords(extractExplanationSection(body));
    const deletionRatio = getDeletionRatio(additions, deletions);
    const shouldComment = wordCount > WORD_COUNT_THRESHOLD && deletionRatio > DELETION_RATIO_THRESHOLD;

    console.log(`Explanation of Change word count: ${wordCount}, deletion ratio: ${deletionRatio.toFixed(2)}`);

    core.setOutput('SHOULD_COMMENT', shouldComment);
    core.setOutput('WORD_COUNT', wordCount);
    core.setOutput('DELETION_RATIO', deletionRatio.toFixed(2));
}

if (import.meta.main) {
    run();
}

export default run;
