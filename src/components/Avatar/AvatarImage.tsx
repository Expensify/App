import React from 'react';
import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Image from '@components/Image';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarBranchCommonProps} from './types';

type AvatarImageProps = AvatarBranchCommonProps & {
    /** URL of the remote avatar image. */
    avatarSource: string;

    /** Callback invoked when the avatar image fails to load. */
    onImageError: () => void;

    /** Styles for View wrapping Icon / Image. */
    imageStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Additional styles for Icon */
    imageContainerAdditionalStyles?: StyleProp<ViewStyle>;
};

/** Renders an avatar as a remote image. */
function AvatarImage({avatarSource, size, type, imageStyles, imageContainerAdditionalStyles, onImageError}: AvatarImageProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const imageStyle = [StyleUtils.getAvatarStyle(size), imageStyles, styles.noBorderRadius];
    const imageContainerStyle = imageStyles ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, imageStyles] : undefined;

    return (
        <View style={[imageContainerStyle, StyleUtils.getAvatarBorderStyle(size, type), imageContainerAdditionalStyles]}>
            {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
            <Image
                source={{uri: avatarSource}}
                style={imageStyle}
                onError={onImageError}
                cachePolicy="memory-disk"
            />
        </View>
    );
}

export default AvatarImage;
