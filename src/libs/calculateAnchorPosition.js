import CONST from '../CONST';
/**
 * Gets the x,y position of the passed in component for the purpose of anchoring another component to it.
 *
 * @param {Element} anchorComponent
 * @param {horizontal: string, vertical: string} anchorOriginValue - Optional parameter
 * @return {Promise<unknown>}
 */
export default function calculateAnchorPosition(anchorComponent, anchorOriginValue) {
    return new Promise((resolve) => {
        if (!anchorComponent) {
            return resolve({horizontal: 0, vertical: 0});
        }
        anchorComponent.measureInWindow((x, y, width, height) => {
            if (anchorOriginValue?.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP && anchorOriginValue?.horizontal === CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT) {
                return resolve({horizontal: x, vertical: y + height});
            }
            return resolve({horizontal: x + width, vertical: y});
        });
    });
}
