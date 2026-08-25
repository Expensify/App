import CONST from '@github/libs/CONST';

import type {ResponseFormatTextJSONSchemaConfig} from 'openai/resources/responses/responses';

type CommentIntentResponse = {
    intent: typeof CONST.INTENT.NOT_AN_ATTEMPT | typeof CONST.INTENT.GENUINE_ATTEMPT | typeof CONST.INTENT.SPAM;
};

type EditCheckResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_EDIT;
};

type DuplicateCheckResponse = {
    similarity: number;
    duplicateCommentID: number | null;
};

const COMMENT_INTENT_RESPONSE_FORMAT: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: 'proposal_police_comment_intent',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            intent: {
                type: 'string',
                enum: [CONST.INTENT.NOT_AN_ATTEMPT, CONST.INTENT.GENUINE_ATTEMPT, CONST.INTENT.SPAM],
                description: 'Whether the comment is trying to claim, bid for, or solve this issue, and if so whether it is a genuine effort or a content-free claim.',
            },
        },
        required: ['intent'],
        additionalProperties: false,
    },
};

const EDIT_CHECK_RESPONSE_FORMAT: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: 'proposal_police_edit_check',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: [CONST.NO_ACTION, CONST.ACTION_EDIT],
                description: `${CONST.ACTION_EDIT} if the edit substantially changed the ROOT CAUSE or SOLUTION, otherwise ${CONST.NO_ACTION}.`,
            },
        },
        required: ['action'],
        additionalProperties: false,
    },
};

const DUPLICATE_CHECK_RESPONSE_FORMAT: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: 'proposal_police_duplicate_check',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            similarity: {
                type: 'integer',
                minimum: 0,
                maximum: 100,
                description: 'How similar the new proposal is to the most similar prior proposal, from 0 (unrelated) to 100 (identical).',
            },
            duplicateCommentID: {
                type: ['number', 'null'],
                description: 'The comment_id of the prior proposal that scored the reported similarity, or null if no prior proposal is similar.',
            },
        },
        required: ['similarity', 'duplicateCommentID'],
        additionalProperties: false,
    },
};

function isCommentIntentResponse(value: unknown): value is CommentIntentResponse {
    if (typeof value !== 'object' || value === null || !('intent' in value)) {
        return false;
    }
    const {intent} = value;
    return intent === CONST.INTENT.NOT_AN_ATTEMPT || intent === CONST.INTENT.GENUINE_ATTEMPT || intent === CONST.INTENT.SPAM;
}

function isEditCheckResponse(value: unknown): value is EditCheckResponse {
    if (typeof value !== 'object' || value === null || !('action' in value)) {
        return false;
    }
    const {action} = value;
    return action === CONST.NO_ACTION || action === CONST.ACTION_EDIT;
}

function isDuplicateCheckResponse(value: unknown): value is DuplicateCheckResponse {
    if (typeof value !== 'object' || value === null || !('similarity' in value) || !('duplicateCommentID' in value)) {
        return false;
    }
    const {similarity, duplicateCommentID} = value;
    // Require the declared 0-100 integer scale, so a rescaled score (e.g. 0.95 on a 0-1 scale) is rejected
    // outright rather than silently comparing below the duplicate threshold and reading as "not a duplicate".
    return typeof similarity === 'number' && Number.isInteger(similarity) && similarity >= 0 && similarity <= 100 && (duplicateCommentID === null || typeof duplicateCommentID === 'number');
}

export {COMMENT_INTENT_RESPONSE_FORMAT, EDIT_CHECK_RESPONSE_FORMAT, DUPLICATE_CHECK_RESPONSE_FORMAT, isCommentIntentResponse, isEditCheckResponse, isDuplicateCheckResponse};
export type {CommentIntentResponse, EditCheckResponse, DuplicateCheckResponse};
