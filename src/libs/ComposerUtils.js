import CONST from '../CONST';

/**
 * Update isFullComposerAvailable if needed
 * @param {Object} props
 * @param {Number} numberOfLines The number of lines in the text input
 */
function updateIsFullComposerAvailable(props, numberOfLines) {
    const isFullComposerAvailable = numberOfLines >= CONST.REPORT.FULL_COMPOSER_MIN_LINES;
    if (isFullComposerAvailable !== props.isFullComposerAvailable) {
        props.setIsFullComposerAvailable(isFullComposerAvailable);
    }
}

export default updateIsFullComposerAvailable;
