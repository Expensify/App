import type GetClickedTargetLocation from './types';

/**
 * We don't need to get the position of the element on native platforms because the popover will be bottom mounted
 */
const getClickedTargetLocation: GetClickedTargetLocation = () => ({top: 0, bottom: 0, left: 0, right: 0, height: 0, x: 0, y: 0});

export default getClickedTargetLocation;
