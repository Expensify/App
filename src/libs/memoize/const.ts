import type {Options} from './types';

const DEFAULT_OPTIONS = {
    maxSize: Infinity,
    equality: 'shallow',
    monitor: false,
    cache: 'array',
} satisfies Options;

// eslint-disable-next-line import/prefer-default-export
export {DEFAULT_OPTIONS};
