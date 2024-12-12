import type {Options} from './types';

const DEFAULT_OPTIONS = {
    maxSize: Infinity,
    equality: 'deep',
    monitor: false,
    cache: 'array',
} satisfies Options<() => unknown, number, unknown>;

export default DEFAULT_OPTIONS;
