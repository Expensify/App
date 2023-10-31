import {TextStyle, ViewStyle} from 'react-native';
import getNumberOfLines from '@libs/ComposerUtils/getNumberOfLines';
import updateIsFullComposerAvailable from '@libs/ComposerUtils/updateIsFullComposerAvailable';
import UpdateNumberOfLines from './types';

/**
 * Check the current scrollHeight of the textarea (minus any padding) and
 * divide by line height to get the total number of rows for the textarea.
 */
const updateNumberOfLines: UpdateNumberOfLines = (styles, props, event) => {
    const lineHeight = (styles.textInputCompose as TextStyle).lineHeight ?? 0;
    const paddingTopAndBottom = ((styles.textInputComposeSpacing as ViewStyle).paddingVertical as number) * 2;
    const inputHeight = event?.nativeEvent?.contentSize?.height ?? null;
    if (!inputHeight) {
        return;
    }
    const numberOfLines = getNumberOfLines(lineHeight, paddingTopAndBottom, inputHeight);
    updateIsFullComposerAvailable(props, numberOfLines);
};

export default updateNumberOfLines;
