import React from 'react';
import type {FC} from 'react';
import {View} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import type {SvgProps} from 'react-native-svg';
import GlobalCreateIcon from '@assets/images/customEmoji/global-create.svg';
import CustomEmojiWithDefaultPressableAction from '@components/HTMLEngineProvider/CustomEmojiWithDefaultPressableAction';
import ImageSVG from '@components/ImageSVG';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

const emojiMap: Record<string, FC<SvgProps>> = {
    actionMenuIcon: GlobalCreateIcon,
};

function CustomEmojiRenderer({tnode}: CustomRendererProps<TText | TPhrasing>) {
    const styles = useThemeStyles();
    const emojiKey = tnode.attributes.emoji;
    const {fontScale} = useResponsiveLayout();

    if (emojiMap[emojiKey]) {
        const image = (
            <View style={styles.customEmoji}>
                <ImageSVG
                    height={variables.iconSizeNormal * fontScale}
                    width={variables.iconSizeNormal * fontScale}
                    src={emojiMap[emojiKey]}
                />
            </View>
        );

        if ('pressablewithdefaultaction' in tnode.attributes) {
            return <CustomEmojiWithDefaultPressableAction emojiKey={emojiKey}>{image}</CustomEmojiWithDefaultPressableAction>;
        }

        return image;
    }

    return null;
}

export default CustomEmojiRenderer;
export {emojiMap};
