import React, {useEffect, useState} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {ValueOf} from 'type-fest';
import useNetwork from '@hooks/useNetwork';
import * as ReportUtils from '@libs/ReportUtils';
import {AvatarSource} from '@libs/UserUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Image from './Image';

type AvatarProps = {
    /** Source for the avatar. Can be a URL or an icon. */
    source?: AvatarSource;

    /** Extra styles to pass to Image */
    imageStyles?: ViewStyle[];

    /** Additional styles to pass to Icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Set the size of Avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /**
     * The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'
     * If the avatar is type === workspace, this fill color will be ignored and decided based on the name prop.
     */
    fill?: string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL.
     * If the avatar is type === workspace, this fallback icon will be ignored and decided based on the name prop.
     */
    fallbackIcon?: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Owner of the avatar. If user, displayName. If workspace, policy name */
    name?: string;
};

function Avatar({
    source,
    imageStyles = [],
    iconAdditionalStyles = [],
    containerStyles = [],
    size = CONST.AVATAR_SIZE.DEFAULT,
    fill = undefined,
    fallbackIcon = Expensicons.FallbackAvatar,
    type = CONST.ICON_TYPE_AVATAR,
    name = '',
}: AvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
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

    const imageStyle = imageStyles?.length ? [StyleUtils.getAvatarStyle(size), imageStyles, styles.noBorderRadius] : [StyleUtils.getAvatarStyle(size), styles.noBorderRadius];

    const iconStyle = imageStyles?.length ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, imageStyles] : undefined;

    const iconFillColor = isWorkspace ? StyleUtils.getDefaultWorkspaceAvatarColor(name).fill : fill ?? theme.icon;
    const fallbackAvatar = isWorkspace ? ReportUtils.getDefaultWorkspaceAvatar(name) : fallbackIcon || Expensicons.FallbackAvatar;

    const avatarSource = imageError ? fallbackAvatar : source;

    return (
        <View style={[containerStyles, styles.pointerEventsNone]}>
            {typeof avatarSource === 'function' ? (
                <View style={iconStyle}>
                    <Icon
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
            ) : (
                <View style={[iconStyle, StyleUtils.getAvatarBorderStyle(size, type), iconAdditionalStyles]}>
                    <Image
                        source={{uri: avatarSource}}
                        style={imageStyle}
                        onError={() => setImageError(true)}
                    />
                </View>
            )}
        </View>
    );
}

Avatar.displayName = 'Avatar';

export default Avatar;
