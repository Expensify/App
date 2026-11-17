import type GetClickedTargetLocation from './types';

/**
 * Returns the Bounding Rectangle for the passed native event's target.
 */
const getClickedTargetLocation: GetClickedTargetLocation = (target) => {
    if (!(target instanceof Element)) {
        throw new TypeError('The clicked target must be a web element');
    }
    return target.getBoundingClientRect();
};

export default getClickedTargetLocation;
