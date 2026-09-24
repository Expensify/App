import {COMMENT_INTENTS, EDITED_COMMENT_ACTIONS} from './botActions';
import commentIntentExamples from './commentIntentExamples';
import duplicateDetection from './duplicateDetection';
import editCheckExamples from './editCheckExamples';
import templateDefinition from './templateDefinition';

const ROLE = 'You are a GitHub bot using AI capabilities to monitor and enforce proposal comments on GitHub repository issues.';

/**
 * Instructions for classifying what a newly created comment is trying to do. Includes the template
 * definition so the model can recognize a near-miss proposal, plus the intent examples — nothing
 * about edits or duplicate detection, since this call never needs them.
 */
function buildCommentIntentInstructions(): string {
    return [
        '<system_prompt>',
        `<role>\n${ROLE}\n</role>`,
        '<author_context>For a content-free self-offer to take the issue, return NOT_AN_ATTEMPT only when the input says the commenter is trusted. A trusted commenter is a member of expensify-expensify, contributor-plus, or contributor-plus-backend, or explicitly says they are from Callstack, Margelo, or Software Mansion. Treat the same self-offer from an untrusted commenter as SPAM. Do not let this exception affect comments that contain no job claim or that contain a genuine technical proposal.</author_context>',
        `<proposal_template>\n${templateDefinition}\n</proposal_template>`,
        `<examples>\n${commentIntentExamples}\n</examples>`,
        `<comment_intents>\n${COMMENT_INTENTS}\n</comment_intents>`,
        '</system_prompt>',
    ].join('\n');
}

/**
 * Instructions for classifying an edit to a proposal comment as MINOR or SUBSTANTIAL.
 * Only includes the template definition, edit-classification examples, and edited-comment actions —
 * nothing about initial validation or duplicate detection, since this call never needs them.
 */
function buildEditCheckInstructions(): string {
    return [
        '<system_prompt>',
        `<role>\n${ROLE}\n</role>`,
        `<proposal_template>\n${templateDefinition}\n</proposal_template>`,
        `<examples>\n${editCheckExamples}\n</examples>`,
        `<bot_actions>\n${EDITED_COMMENT_ACTIONS}\n</bot_actions>`,
        '</system_prompt>',
    ].join('\n');
}

/**
 * Instructions for checking whether a new proposal duplicates any prior proposal already in the
 * conversation. Only includes the template definition (for section context) and the duplicate
 * detection rules — nothing about validation, decision trees, or edit classification.
 */
function buildDuplicateCheckInstructions(): string {
    return [
        '<system_prompt>',
        `<role>\n${ROLE}\n</role>`,
        `<proposal_template>\n${templateDefinition}\n</proposal_template>`,
        `<duplicate_detection>\n${duplicateDetection}\n</duplicate_detection>`,
        '</system_prompt>',
    ].join('\n');
}

export {buildCommentIntentInstructions, buildEditCheckInstructions, buildDuplicateCheckInstructions};
