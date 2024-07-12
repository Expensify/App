import type {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import type {ComposerProps} from '@components/Composer/types';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';

/**
 * Update isFullComposerAvailable if needed
 * @param numberOfLines The number of lines in the text input
 */
function updateIsFullComposerAvailable(props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>, styles: ThemeStyles, shouldIncludePadding = false) {
    const paddingTopAndBottom = shouldIncludePadding ? styles.textInputComposeSpacing.paddingVertical * 2 : 0;
    const inputHeight = event?.nativeEvent?.contentSize?.height ?? null;
    if (!inputHeight) {
        return;
    }
    const totalHeight = inputHeight + paddingTopAndBottom;
    const isFullComposerAvailable = totalHeight >= CONST.COMPOSER.FULL_COMPOSER_MIN_HEIGHT;
    if (isFullComposerAvailable !== props.isFullComposerAvailable) {
        props.setIsFullComposerAvailable?.(isFullComposerAvailable);
    }
}

export default updateIsFullComposerAvailable;
