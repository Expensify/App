/**
 * Allows us to identify whether the platform is hoverable.
 *
 * @returns {Boolean}
 */
function hasHoverSupport() {
    return !window.matchMedia('(hover: none)').matches;
}

export default hasHoverSupport;
