import React from 'react';
import {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import {useComposerMeta, useComposerSendState, useComposerState} from './ComposerContext';

type ComposerBoxProps = {
    reportID: string;
    children: React.ReactNode;
};

function ComposerBox({reportID, children}: ComposerBoxProps) {
    const styles = useThemeStyles();
    const {isFocused} = useComposerState();
    const {isExceedingMaxLength, isBlockedFromConcierge} = useComposerSendState();
    const {containerRef} = useComposerMeta();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const shouldUseFocusedColor = !isBlockedFromConcierge && isFocused;

    const containerStyles = [
        shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
        styles.flexRow,
        styles.chatItemComposeBox,
        isComposerFullSize && styles.chatItemFullComposeBox,
        isExceedingMaxLength && styles.borderColorDanger,
    ];

    return (
        <View
            ref={containerRef}
            style={containerStyles}
        >
            {children}
        </View>
    );
}

export default ComposerBox;
