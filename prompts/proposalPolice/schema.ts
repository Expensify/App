import CONST from '@github/libs/CONST';

import type {ResponseFormatTextJSONSchemaConfig} from 'openai/resources/responses/responses';

type TemplateCheckResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_REQUIRED;
};

type EditCheckResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_EDIT;
};

type DuplicateCheckResponse = {
    similarity: number;
    duplicateCommentId: number | null;
};

const TEMPLATE_CHECK_RESPONSE_FORMAT: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: 'proposal_police_template_check',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: [CONST.NO_ACTION, CONST.ACTION_REQUIRED],
                description: `${CONST.ACTION_REQUIRED} if the comment is a proposal missing a mandatory line, otherwise ${CONST.NO_ACTION}.`,
            },
        },
        required: ['action'],
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
            duplicateCommentId: {
                type: ['number', 'null'],
                description: 'The comment_id of the prior proposal that scored the reported similarity, or null if no prior proposal is similar.',
            },
        },
        required: ['similarity', 'duplicateCommentId'],
        additionalProperties: false,
    },
};

function isTemplateCheckResponse(value: unknown): value is TemplateCheckResponse {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const {action} = value as Partial<TemplateCheckResponse>;
    return action === CONST.NO_ACTION || action === CONST.ACTION_REQUIRED;
}

function isEditCheckResponse(value: unknown): value is EditCheckResponse {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const {action} = value as Partial<EditCheckResponse>;
    return action === CONST.NO_ACTION || action === CONST.ACTION_EDIT;
}

function isDuplicateCheckResponse(value: unknown): value is DuplicateCheckResponse {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const {similarity, duplicateCommentId} = value as Partial<DuplicateCheckResponse>;
    // Require the declared 0-100 integer scale, so a rescaled score (e.g. 0.95 on a 0-1 scale) is rejected
    // outright rather than silently comparing below the duplicate threshold and reading as "not a duplicate".
    return Number.isInteger(similarity) && (similarity ?? -1) >= 0 && (similarity ?? -1) <= 100 && (duplicateCommentId === null || typeof duplicateCommentId === 'number');
}

export {TEMPLATE_CHECK_RESPONSE_FORMAT, EDIT_CHECK_RESPONSE_FORMAT, DUPLICATE_CHECK_RESPONSE_FORMAT, isTemplateCheckResponse, isEditCheckResponse, isDuplicateCheckResponse};
export type {TemplateCheckResponse, EditCheckResponse, DuplicateCheckResponse};
