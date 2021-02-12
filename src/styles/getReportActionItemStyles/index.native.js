import getContainerStyle from './getContainerStyle';

function getModalStyleOverride() {
    return {};
}

/**
 * Generate the styles for the ReportActionItem component.
 *
 * @param {Boolean} isHovered
 * @param {Number} anchorX
 * @param {Number} anchorY
 * @returns {Object}
 */
export default function (isHovered = false, anchorX = null, anchorY = null) {
    return {
        containerStyle: getContainerStyle(isHovered),
        modalStyleOverride: getModalStyleOverride(anchorX, anchorY),
    };
}
