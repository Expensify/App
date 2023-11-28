import getNumberOfLines from '@libs/ComposerUtils/getNumberOfLines';
import updateIsFullComposerAvailable from '@libs/ComposerUtils/updateIsFullComposerAvailable';
import styles from '@styles/styles';
import UpdateNumberOfLines from './types';

/**
 * Check the current scrollHeight of the textarea (minus any padding) and
 * divide by line height to get the total number of rows for the textarea.
 */
const updateNumberOfLines: UpdateNumberOfLines = (props, event) => {
    const lineHeight = styles.textInputCompose.lineHeight ?? 0;
    const paddingTopAndBottom = styles.textInputComposeSpacing.paddingVertical * 2;
    const inputHeight = event?.nativeEvent?.contentSize?.height ?? null;
    if (!inputHeight) {
        return;
    }
    const numberOfLines = getNumberOfLines(lineHeight, paddingTopAndBottom, inputHeight);
    updateIsFullComposerAvailable(props, numberOfLines);
};

export default updateNumberOfLines;
