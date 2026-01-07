import type {RefObject} from 'react';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import Avatar from './Avatar';
import Icon from './Icon';
import OfflineWithFeedback from './OfflineWithFeedback';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip';

type AvatarButtonWithIconProps = {
    /** Text to be used as a tooltip */
    text: string;

    /** Style applied to the avatar */
    avatarStyle: StyleProp<ViewStyle & ImageStyle>;

    /** Executed on click */
    onPress: () => void;

    /** Ref of the anchor */
    anchorRef?: RefObject<View | HTMLDivElement | null>;

    /** Account id of user for which avatar is displayed  */
    avatarID?: number | string;

    /** Avatar source to display */
    source?: AvatarSource;

    /** Additional style props for disabled picker */
    disabledStyle?: StyleProp<ViewStyle>;

    /** Additional style props for the edit icon */
    editIconStyle?: StyleProp<ViewStyle>;

    /** A default avatar component to display when there is no source */
    DefaultAvatar?: () => React.ReactNode;

    /** Size of Indicator */
    size?: typeof CONST.AVATAR_SIZE.X_LARGE | typeof CONST.AVATAR_SIZE.LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;

    /** Indicates if picker feature should be disabled */
    disabled?: boolean;

    /** Optionally override the default "Edit" icon */
    editIcon?: IconAsset;

    /** The name associated with avatar */
    name?: string;
};

/**
 * Avatar button with an edit icon overlay
 */
function AvatarButtonWithIcon({
    DefaultAvatar = () => null,
    disabledStyle,
    editIconStyle,
    pendingAction,
    text,
    onPress,
    source = '',
    avatarID,
    fallbackIcon,
    size = CONST.AVATAR_SIZE.DEFAULT,
    type = CONST.ICON_TYPE_AVATAR,
    avatarStyle,
    disabled = false,
    editIcon,
    anchorRef,
    name = '',
}: AvatarButtonWithIconProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'Pencil']);

    return (
        <Tooltip
            shouldRender={!disabled}
            text={text}
        >
            <PressableWithoutFeedback
                onPress={onPress}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={text}
                disabled={disabled}
                disabledStyle={disabledStyle}
                style={[styles.pRelative, type === CONST.ICON_TYPE_AVATAR && styles.alignSelfCenter, avatarStyle]}
                ref={anchorRef}
            >
                <OfflineWithFeedback pendingAction={pendingAction}>
                    {source ? (
                        <Avatar
                            containerStyles={avatarStyle}
                            imageStyles={[styles.alignSelfCenter, avatarStyle]}
                            source={source}
                            avatarID={avatarID}
                            fallbackIcon={fallbackIcon ?? expensifyIcons.FallbackAvatar}
                            size={size}
                            type={type}
                            name={name}
                        />
                    ) : (
                        <DefaultAvatar />
                    )}
                </OfflineWithFeedback>
                {!disabled && (
                    <View style={StyleSheet.flatten([styles.smallEditIcon, styles.smallAvatarEditIcon, editIconStyle])}>
                        <Icon
                            testID="avatar-button-edit-icon"
                            src={editIcon ?? expensifyIcons.Pencil}
                            width={variables.iconSizeSmall}
                            height={variables.iconSizeSmall}
                            fill={theme.icon}
                        />
                    </View>
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default AvatarButtonWithIcon;
export type {AvatarButtonWithIconProps};
