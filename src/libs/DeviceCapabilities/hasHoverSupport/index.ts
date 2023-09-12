/**
 * Allows us to identify whether the platform is hoverable.
 *
 * @returns {Boolean}
 */
function hasHoverSupport() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export default hasHoverSupport;
