import React, {useEffect, useState} from 'react';
import type {ImageStyle, StyleProp} from 'react-native';
import {View} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Image from './Image';
import type AvatarProps from './types';

function Avatar({
    source,
    imageStyles,
    iconAdditionalStyles,
    containerStyles,
    size = CONST.AVATAR_SIZE.DEFAULT,
    fill,
    fallbackIcon = Expensicons.FallbackAvatar,
    fallbackIconTestID = '',
    type = CONST.ICON_TYPE_AVATAR,
    name = '',
}: AvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [imageError, setImageError] = useState(false);

    useNetwork({onReconnect: () => setImageError(false)});

    useEffect(() => {
        setImageError(false);
    }, [source]);

    if (!source) {
        return null;
    }

    const isWorkspace = type === CONST.ICON_TYPE_WORKSPACE;
    const iconSize = StyleUtils.getAvatarSize(size);

    const imageStyle: StyleProp<ImageStyle> = [StyleUtils.getAvatarStyle(size), imageStyles, styles.noBorderRadius];
    const iconStyle = imageStyles ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, imageStyles] : undefined;

    const iconFillColor = isWorkspace ? StyleUtils.getDefaultWorkspaceAvatarColor(name).fill : fill;
    const fallbackAvatar = isWorkspace ? ReportUtils.getDefaultWorkspaceAvatar(name) : fallbackIcon || Expensicons.FallbackAvatar;
    const fallbackAvatarTestID = isWorkspace ? ReportUtils.getDefaultWorkspaceAvatarTestID(name) : fallbackIconTestID || 'SvgFallbackAvatar Icon';

    const avatarSource = imageError ? fallbackAvatar : source;

    return (
        <View style={[containerStyles, styles.pointerEventsNone]}>
            {typeof avatarSource === 'string' ? (
                <View style={[iconStyle, StyleUtils.getAvatarBorderStyle(size, type), iconAdditionalStyles]}>
                    <Image
                        source={{uri: avatarSource}}
                        style={imageStyle}
                        onError={() => setImageError(true)}
                    />
                </View>
            ) : (
                <View style={iconStyle}>
                    <Icon
                        testID={fallbackAvatarTestID}
                        src={avatarSource}
                        height={iconSize}
                        width={iconSize}
                        fill={imageError ? theme.offline : iconFillColor}
                        additionalStyles={[
                            StyleUtils.getAvatarBorderStyle(size, type),
                            isWorkspace && StyleUtils.getDefaultWorkspaceAvatarColor(name),
                            imageError && StyleUtils.getBackgroundColorStyle(theme.fallbackIconColor),
                            iconAdditionalStyles,
                        ]}
                    />
                </View>
            )}
        </View>
    );
}

Avatar.displayName = 'Avatar';

export default Avatar;
