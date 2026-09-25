import type TabBarBlurTargetProps from './types';

/**
 * The web bar blurs through a CSS backdrop filter, which needs no view to sample from, so the scene renders as is.
 */
function TabBarBlurTarget({children}: TabBarBlurTargetProps) {
    return children;
}

export default TabBarBlurTarget;
