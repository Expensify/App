import React, {useContext} from 'react';
import {FABPopoverContext} from '@components/FABPopoverProvider';
import ImageSVG from '@components/ImageSVG';
import {PressableWithoutFeedback} from '@components/Pressable';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {emojiMap} from './HTMLRenderers/CustomEmojiRenderer';

type CustomEmojiWithDefaultPressableActionProps = {
    emojiKey: string;
};

function CustomEmojiWithDefaultPressableAction({emojiKey}: CustomEmojiWithDefaultPressableActionProps) {
    const styles = useThemeStyles();

    const image = (
        <ImageSVG
            src={emojiMap[emojiKey]}
            width={variables.iconSizeNormal}
            height={variables.iconSizeNormal}
        />
    );
    const {isCreateMenuActive, setIsCreateMenuActive} = useContext(FABPopoverContext);

    if (emojiKey === 'action-menu-icon') {
        return (
            <PressableWithoutFeedback
                onPress={() => setIsCreateMenuActive(!isCreateMenuActive)}
                style={styles.customEmoji}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Press to create a new item"
            >
                <ImageSVG
                    src={emojiMap[emojiKey]}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                />
            </PressableWithoutFeedback>
        );
    }
    return image;
}

export default CustomEmojiWithDefaultPressableAction;
