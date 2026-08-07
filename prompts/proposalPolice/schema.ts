import CONST from '@github/libs/CONST';

import type {ResponseFormatTextJSONSchemaConfig} from 'openai/resources/responses/responses';

type TemplateCheckResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_REQUIRED;
    message: string;
};

type EditCheckResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_EDIT;
    message: string;
};

type DuplicateCheckResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_HIDE_DUPLICATE;
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
            action: {type: 'string', enum: [CONST.NO_ACTION, CONST.ACTION_REQUIRED]},
            message: {type: 'string'},
        },
        required: ['action', 'message'],
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
            action: {type: 'string', enum: [CONST.NO_ACTION, CONST.ACTION_EDIT]},
            message: {type: 'string'},
        },
        required: ['action', 'message'],
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
            action: {type: 'string', enum: [CONST.NO_ACTION, CONST.ACTION_HIDE_DUPLICATE]},
            similarity: {type: 'number'},
            duplicateCommentId: {type: ['number', 'null']},
        },
        required: ['action', 'similarity', 'duplicateCommentId'],
        additionalProperties: false,
    },
};

function isTemplateCheckResponse(value: unknown): value is TemplateCheckResponse {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const {action, message} = value as Partial<TemplateCheckResponse>;
    return (action === CONST.NO_ACTION || action === CONST.ACTION_REQUIRED) && typeof message === 'string';
}

function isEditCheckResponse(value: unknown): value is EditCheckResponse {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const {action, message} = value as Partial<EditCheckResponse>;
    return (action === CONST.NO_ACTION || action === CONST.ACTION_EDIT) && typeof message === 'string';
}

function isDuplicateCheckResponse(value: unknown): value is DuplicateCheckResponse {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const {action, similarity, duplicateCommentId} = value as Partial<DuplicateCheckResponse>;
    return (
        (action === CONST.NO_ACTION || action === CONST.ACTION_HIDE_DUPLICATE) && typeof similarity === 'number' && (duplicateCommentId === null || typeof duplicateCommentId === 'number')
    );
}

export {TEMPLATE_CHECK_RESPONSE_FORMAT, EDIT_CHECK_RESPONSE_FORMAT, DUPLICATE_CHECK_RESPONSE_FORMAT, isTemplateCheckResponse, isEditCheckResponse, isDuplicateCheckResponse};
export type {TemplateCheckResponse, EditCheckResponse, DuplicateCheckResponse};
