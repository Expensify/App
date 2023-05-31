import lodashGet from 'lodash/get';
import styles from '../../../styles/styles';
import updateIsFullComposerAvailable from '../updateIsFullComposerAvailable';
import getNumberOfLines from '../getNumberOfLines';

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

export default updateNumberOfLines;
