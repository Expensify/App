import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import updateIsFullComposerAvailable from './updateIsFullComposerAvailable';

/**
 * Get the current number of lines in the composer
 *
 * @param {Number} lineHeight
 * @param {Number} paddingTopAndBottom
 * @param {Number} scrollHeight
 *
 * @returns {Number}
 */
function getNumberOfLines(lineHeight, paddingTopAndBottom, scrollHeight) {
    return Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);
}

/**
 * Check the current scrollHeight of the textarea (minus any padding) and
 * divide by line height to get the total number of rows for the textarea.
 * @param {Object} props
 * @param {Event} e
 */
function updateNumberOfLines(props, e) {
    const lineHeight = styles.textInputCompose.lineHeight;
    const paddingTopAndBottom = styles.textInputComposeSpacing.paddingVertical * 2;
    const inputHeight = lodashGet(e, 'nativeEvent.contentSize.height', null);
    if (!inputHeight) {
        return;
    }
    const numberOfLines = getNumberOfLines(lineHeight, paddingTopAndBottom, inputHeight);
    updateIsFullComposerAvailable(props, numberOfLines);
}

export {
    getNumberOfLines,
    updateNumberOfLines,
};
