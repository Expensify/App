import React from 'react';
import {Platform, View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import useThemeStyles from '@hooks/useThemeStyles';
import FloatingActionButtonAndPopover from '@pages/home/sidebar/SidebarScreen/FloatingActionButtonAndPopover';
import variables from '@styles/variables';
import {emojiMap} from './HTMLRenderers/CustomEmojiRenderer';

type CustomEmojiWithDefaultPressableActionProps = {
    emojiKey: string;
};

function CustomEmojiWithDefaultPressableAction({emojiKey}: CustomEmojiWithDefaultPressableActionProps) {
    const styles = useThemeStyles();
    const positionFix = Platform.OS !== 'web' && {height: '5%'};

    const image = (
        <View style={[styles.customEmoji, positionFix]}>
            <ImageSVG
                src={emojiMap[emojiKey]}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );

    if (emojiKey === 'action-menu-icon') {
        return <FloatingActionButtonAndPopover isEmoji>{image}</FloatingActionButtonAndPopover>;
    }

    return image;
}

export default CustomEmojiWithDefaultPressableAction;
