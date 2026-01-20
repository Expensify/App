import React, {useEffect, useState} from 'react';
import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAvatarLocal} from '@libs/Avatars/PresetAvatarCatalog';
import {getDefaultWorkspaceAvatar, getDefaultWorkspaceAvatarTestID} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {getAvatar, getPresetAvatarNameFromURL} from '@libs/UserAvatarUtils';
import type {AvatarSizeName} from '@styles/utils';
import CONST from '@src/CONST';
import type {AvatarType} from '@src/types/onyx/OnyxCommon';
import Icon from './Icon';
import Image from './Image';

type AvatarProps = {
    /** Source for the avatar. Can be a URL or an icon. */
    source?: AvatarSource;

    /** Extra styles to pass to Image */
    imageStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Additional styles to pass to Icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Set the size of Avatar */
    size?: AvatarSizeName;

    /**
     * The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'
     * If the avatar is type === workspace, this fill color will be ignored and decided based on the name prop.
     */
    fill?: string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL.
     * If the avatar is type === workspace, this fallback icon will be ignored and decided based on the name prop.
     */
    fallbackIcon?: AvatarSource;

    /** Used to locate fallback icon in end-to-end tests. */
    fallbackIconTestID?: string;

    /** Owner of the avatar. If user, displayName. If workspace, policy name */
    name?: string;

    /** Denotes whether it is an avatar or a workspace avatar */
    type: AvatarType;

    /** Optional account id if it's user avatar or policy id if it's workspace avatar */
    avatarID?: number | string;

    /** Test ID for the Avatar component */
    testID?: string;
};

function Avatar({
    source: originalSource,
    imageStyles,
    iconAdditionalStyles,
    containerStyles,
    size = CONST.AVATAR_SIZE.DEFAULT,
    fill,
    fallbackIcon,
    fallbackIconTestID = '',
    type,
    name = '',
    avatarID,
    testID = 'Avatar',
}: AvatarProps) {
    const defaultAvatars = useDefaultAvatars();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [imageError, setImageError] = useState(false);

    useNetwork({onReconnect: () => setImageError(false)});

    useEffect(() => {
        setImageError(false);
    }, [originalSource]);

    const isWorkspace = type === CONST.ICON_TYPE_WORKSPACE;
    const userAccountID = isWorkspace ? undefined : (avatarID as number);

    const source = isWorkspace ? originalSource : getAvatar({avatarSource: originalSource, accountID: userAccountID, defaultAvatars});
    let optimizedSource = source;
    const maybeDefaultAvatarName = getPresetAvatarNameFromURL(source);

    if (maybeDefaultAvatarName) {
        optimizedSource = getAvatarLocal(maybeDefaultAvatarName);
    }
    const useFallBackAvatar = imageError || !source || source === defaultAvatars.FallbackAvatar;
    const fallbackAvatar = isWorkspace ? getDefaultWorkspaceAvatar(name) : (fallbackIcon ?? defaultAvatars.FallbackAvatar) || defaultAvatars.FallbackAvatar;
    const fallbackAvatarTestID = isWorkspace ? getDefaultWorkspaceAvatarTestID(name) : fallbackIconTestID || 'SvgFallbackAvatar Icon';
    const avatarSource = useFallBackAvatar ? fallbackAvatar : optimizedSource;

    // We pass the color styles down to the SVG for the workspace and fallback avatar.
    const iconSize = StyleUtils.getAvatarSize(size);
    const imageStyle: StyleProp<ImageStyle> = [StyleUtils.getAvatarStyle(size), imageStyles, styles.noBorderRadius];
    const iconStyle = imageStyles ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, imageStyles] : undefined;

    let iconColors;
    if (isWorkspace) {
        iconColors = StyleUtils.getDefaultWorkspaceAvatarColor(avatarID?.toString() ?? '');
        // Assign the icon fill color only for the default fallback avatar
    } else if (useFallBackAvatar && avatarSource === defaultAvatars.FallbackAvatar) {
        iconColors = StyleUtils.getBackgroundColorAndFill(theme.buttonHoveredBG, theme.icon);
    } else {
        iconColors = null;
    }
    return (
        <View
            style={[containerStyles, styles.pointerEventsNone]}
            testID={testID}
        >
            {typeof avatarSource === 'string' ? (
                <View style={[iconStyle, StyleUtils.getAvatarBorderStyle(size, type), iconAdditionalStyles]}>
                    <Image
                        source={{uri: avatarSource}}
                        style={imageStyle}
                        onError={() => setImageError(true)}
                        cachePolicy="memory-disk"
                    />
                </View>
            ) : (
                <View style={iconStyle}>
                    <Icon
                        testID={fallbackAvatarTestID}
                        src={avatarSource}
                        height={iconSize}
                        width={iconSize}
                        fill={imageError ? (iconColors?.fill ?? theme.offline) : (iconColors?.fill ?? fill)}
                        additionalStyles={[StyleUtils.getAvatarBorderStyle(size, type), iconColors, iconAdditionalStyles]}
                    />
                </View>
            )}
        </View>
    );
}

export type {AvatarProps};
export default Avatar;
