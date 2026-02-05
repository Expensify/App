import type {Log} from './types';

/** Web does not use Firebase for performance tracing */
const log: Log = () => {};

export default {
    log,
};
