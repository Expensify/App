/**
 * Gets the x,y position of the passed in component for the purpose of anchoring another component to it.
 *
 * @param {Element} anchorComponent
 * @return {Promise<unknown>}
 */
export default function calculateAnchorPosition(anchorComponent) {
    return new Promise((resolve) => {
        if (!anchorComponent) {
            return resolve({horizontal: 0, vertical: 0});
        }
        anchorComponent.measureInWindow((x, y, width) => resolve({horizontal: x + width, vertical: y}));
    });
}
