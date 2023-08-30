import GetClickedTargetLocation from './types';

/**
 * Returns the Bounding Rectangle for the passed native event's target.
 */
const getClickedTargetLocation: GetClickedTargetLocation = (target) => target.getBoundingClientRect();

export default getClickedTargetLocation;
