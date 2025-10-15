import React from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import useStyleUtils from '@hooks/useStyleUtils';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';
import ImageSVG from './ImageSVG';

type ColoredAvatarProps = {
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
 * ColoredAvatar renders an SVG component with a colored circular background.
 * Used for letter avatars and other colored icon avatars.
 */
function ColoredAvatar({component, backgroundColor, fillColor, size = CONST.AVATAR_SIZE.MEDIUM}: ColoredAvatarProps) {
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

ColoredAvatar.displayName = 'ColoredAvatar';

export default ColoredAvatar;
export type {ColoredAvatarProps};
