import React from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import useStyleUtils from '@hooks/useStyleUtils';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';
import ImageSVG from './ImageSVG';

type ColoredLetterAvatarProps = {
    /** The SVG component to render */
    component: React.FC<SvgProps>;
    /** Background color for the circular background */
    backgroundColor: string;
    /** Fill color for the SVG icon */
    fillColor: string;
    /** Size of the avatar */
    size?: AvatarSizeName;
};

/**
 * ColoredLetterAvatar renders an SVG component with a colored circular background.
 * Used for letter avatars and other colored icon avatars.
 */
function ColoredLetterAvatar({component, backgroundColor, fillColor, size = CONST.AVATAR_SIZE.MEDIUM}: ColoredLetterAvatarProps) {
    const StyleUtils = useStyleUtils();
    const avatarSize = StyleUtils.getAvatarSize(size);
    return (
        <View
            style={{width: avatarSize, height: avatarSize, backgroundColor}}
            dataSet={{id: 'colored-avatar'}}
        >
            <ImageSVG
                src={component}
                width={avatarSize}
                height={avatarSize}
                fill={fillColor}
            />
        </View>
    );
}

export default ColoredLetterAvatar;
