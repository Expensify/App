import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {RefObject} from 'react';
import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import Icon from './Icon';
import OfflineWithFeedback from './OfflineWithFeedback';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip';

type AvatarButtonWithIconProps = WithSentryLabel & {
    /** Text to be used as a tooltip */
    text: string;

    /** Style applied to the avatar. Defaults to centering it within the parent. */
    avatarStyle?: StyleProp<ViewStyle & ImageStyle>;

    /** Executed on click */
    onPress: () => void;

    /** Ref of the anchor */
    anchorRef?: RefObject<View | HTMLDivElement | null>;

    /** The avatar to display. */
    avatar: React.ReactNode;

    /** Size of the displayed avatar. Keeps the button footprint even when `avatar` is empty. */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Additional style props for disabled picker */
    disabledStyle?: StyleProp<ViewStyle>;

    /** Additional style props for the edit icon */
    editIconStyle?: StyleProp<ViewStyle>;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;

    /** Indicates if picker feature should be disabled */
    disabled?: boolean;

    /** Optionally override the default "Edit" icon */
    editIcon?: IconAsset;
};

/**
 * Avatar button with an edit icon overlay
 */
function AvatarButtonWithIcon({
    disabledStyle,
    editIconStyle,
    pendingAction,
    text,
    onPress,
    avatar,
    size = CONST.AVATAR_SIZE.XXXX_LARGE,
    avatarStyle,
    disabled = false,
    editIcon,
    anchorRef,
    sentryLabel,
}: AvatarButtonWithIconProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Pencil']);

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
                style={[styles.pRelative, StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size)), styles.alignSelfCenter, avatarStyle]}
                ref={anchorRef}
                sentryLabel={sentryLabel}
            >
                <OfflineWithFeedback pendingAction={pendingAction}>{avatar}</OfflineWithFeedback>
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
