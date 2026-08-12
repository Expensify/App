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
            action: {type: 'string', enum: [CONST.NO_ACTION, CONST.ACTION_REQUIRED]},
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
            action: {type: 'string', enum: [CONST.NO_ACTION, CONST.ACTION_EDIT]},
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
            similarity: {type: 'number'},
            duplicateCommentId: {type: ['number', 'null']},
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
    return typeof similarity === 'number' && (duplicateCommentId === null || typeof duplicateCommentId === 'number');
}

export {TEMPLATE_CHECK_RESPONSE_FORMAT, EDIT_CHECK_RESPONSE_FORMAT, DUPLICATE_CHECK_RESPONSE_FORMAT, isTemplateCheckResponse, isEditCheckResponse, isDuplicateCheckResponse};
export type {TemplateCheckResponse, EditCheckResponse, DuplicateCheckResponse};
