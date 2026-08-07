import {EDITED_COMMENT_ACTIONS, NEW_COMMENT_ACTIONS} from './botActions';
import decisionTree from './decisionTree';
import duplicateDetection from './duplicateDetection';
import editCheckExamples from './editCheckExamples';
import templateCheckExamples from './templateCheckExamples';
import templateDefinition from './templateDefinition';

const ROLE = 'You are a GitHub bot using AI capabilities to monitor and enforce proposal comments on GitHub repository issues.';

/**
 * Instructions for checking whether a newly created comment is a valid proposal.
 * Only includes the template definition, validation/identification examples, decision tree, and new-comment actions —
 * nothing about edits or duplicate detection, since this call never needs them.
 */
function buildTemplateCheckInstructions(): string {
    return [
        '<system_prompt>',
        `<role>\n${ROLE}\n</role>`,
        `<proposal_template>\n${templateDefinition}\n</proposal_template>`,
        `<examples>\n${templateCheckExamples}\n</examples>`,
        `<decision_tree>\n${decisionTree}\n</decision_tree>`,
        `<bot_actions>\n${NEW_COMMENT_ACTIONS}\n</bot_actions>`,
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

export {buildTemplateCheckInstructions, buildEditCheckInstructions, buildDuplicateCheckInstructions};
