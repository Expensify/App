import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import Avatar from '..';
import getSubscriptAvatarSizing from './getSubscriptAvatarSizing';
import SubscriptAvatarFrame from './SubscriptAvatarFrame';

type PressableSubscriptAvatarProps = {
    /** Size of the subscript stack */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** The primary (main) avatar */
    primaryAvatar: IconType;

    /** The secondary (subscript) avatar */
    secondaryAvatar: IconType;

    /** Called with the pressed avatar */
    onAvatarPress: (avatar: IconType) => void;

    /** Sentry label applied to both pressables */
    sentryLabel: string;

    /** Style for the avatar container */
    containerStyle?: StyleProp<ViewStyle>;
};

/** `PressableSubscriptAvatar` renders a subscript avatar stack where each avatar is its own press target. */
function PressableSubscriptAvatar({size, primaryAvatar, secondaryAvatar, onAvatarPress, sentryLabel, containerStyle}: PressableSubscriptAvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {subscriptSize, borderWidthSize, containerStyleKey} = getSubscriptAvatarSizing(size);

    const getAccessibilityLabel = (avatar: IconType) => translate(avatar.type === CONST.ICON_TYPE_WORKSPACE ? 'common.workspaces' : 'common.profile');

    return (
        <SubscriptAvatarFrame
            size={size}
            containerStyle={containerStyle}
            primary={
                <AvatarTooltip avatar={primaryAvatar}>
                    <PressableWithoutFocus
                        onPress={() => onAvatarPress(primaryAvatar)}
                        accessibilityLabel={getAccessibilityLabel(primaryAvatar)}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        sentryLabel={sentryLabel}
                    >
                        <Avatar
                            containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))}
                            type={primaryAvatar.type}
                            source={primaryAvatar.source}
                            name={primaryAvatar.name ?? ''}
                            avatarID={primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                            fallbackIcon={primaryAvatar.fallbackIcon}
                            fill={primaryAvatar.fill}
                            size={size}
                            testID="ReportActionAvatars-Subscript-MainAvatar"
                        />
                    </PressableWithoutFocus>
                </AvatarTooltip>
            }
            secondary={
                <AvatarTooltip
                    avatar={secondaryAvatar}
                    style={styles[containerStyleKey]}
                >
                    <PressableWithoutFocus
                        onPress={() => onAvatarPress(secondaryAvatar)}
                        accessibilityLabel={getAccessibilityLabel(secondaryAvatar)}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        sentryLabel={sentryLabel}
                    >
                        <Avatar
                            iconAdditionalStyles={[StyleUtils.getAvatarBorderWidth(borderWidthSize), StyleUtils.getBorderColorStyle(theme.componentBG)]}
                            type={secondaryAvatar.type}
                            source={secondaryAvatar.source}
                            name={secondaryAvatar.name ?? ''}
                            avatarID={secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                            fallbackIcon={secondaryAvatar.fallbackIcon}
                            fill={secondaryAvatar.fill}
                            size={subscriptSize}
                            testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                        />
                    </PressableWithoutFocus>
                </AvatarTooltip>
            }
        />
    );
}

export default PressableSubscriptAvatar;
