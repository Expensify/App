const INTEGRATION_ENTITY_MAP_TYPES = {
    DEFAULT: 'DEFAULT',
    NONE: 'NONE',
    TAG: 'TAG',
    REPORT_FIELD: 'REPORT_FIELD',
    NOT_IMPORTED: 'NOT_IMPORTED',
    IMPORTED: 'IMPORTED',
    NETSUITE_DEFAULT: 'NETSUITE_DEFAULT',
} as const;

// eslint-disable-next-line import/prefer-default-export -- Preserve the named API used by the extracted CONST module.
export {INTEGRATION_ENTITY_MAP_TYPES};
