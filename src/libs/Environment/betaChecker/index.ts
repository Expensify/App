import type {IsBetaBuild} from './types';

/**
 * There's no beta build in non native
 */
function isBetaBuild(): IsBetaBuild {
    return Promise.resolve(false);
}

export default {
    isBetaBuild,
};
