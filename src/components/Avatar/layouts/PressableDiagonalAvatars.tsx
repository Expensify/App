import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import Avatar from '..';
import DiagonalAvatarsFrame from './DiagonalAvatarsFrame';
import getDiagonalAvatarSizing from './getDiagonalAvatarSizing';

type PressableDiagonalAvatarsProps = {
    /** Size of the diagonal stack */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** The primary (top-left) avatar */
    primaryAvatar: IconType;

    /** The secondary (bottom-right) avatar */
    secondaryAvatar: IconType;

    /** Total number of icons the stack represents (affects the xxxx-large right margin, matching `DiagonalAvatars`) */
    iconCount: number;

    /** Called with the pressed avatar */
    onAvatarPress: (avatar: IconType) => void;

    /** Sentry label applied to both pressables */
    sentryLabel: string;
};

/** `PressableDiagonalAvatars` renders a diagonal avatar stack where each avatar is its own press target. */
function PressableDiagonalAvatars({size, primaryAvatar, secondaryAvatar, iconCount, onAvatarPress, sentryLabel}: PressableDiagonalAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {avatarSize, singleAvatarStyleKey} = getDiagonalAvatarSizing(size);

    const getAccessibilityLabel = (avatar: IconType) => translate(avatar.type === CONST.ICON_TYPE_WORKSPACE ? 'common.workspaces' : 'common.profile');

    const renderPressableAvatar = (avatar: IconType, testID: string) => (
        <UserDetailsTooltip
            shouldRender
            accountID={Number(avatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            icon={avatar}
            fallbackUserDetails={{
                displayName: avatar.name,
            }}
        >
            <View>
                <PressableWithoutFocus
                    onPress={() => onAvatarPress(avatar)}
                    accessibilityLabel={getAccessibilityLabel(avatar)}
                    accessibilityRole={CONST.ROLE.BUTTON}
                    sentryLabel={sentryLabel}
                >
                    <Avatar
                        type={avatar.type}
                        source={avatar.source}
                        name={avatar.name ?? ''}
                        avatarID={avatar.id ?? CONST.DEFAULT_NUMBER_ID}
                        fallbackIcon={avatar.fallbackIcon}
                        fill={avatar.fill}
                        size={avatarSize}
                        imageStyles={styles[singleAvatarStyleKey]}
                        testID={testID}
                    />
                </PressableWithoutFocus>
            </View>
        </UserDetailsTooltip>
    );

    return (
        <DiagonalAvatarsFrame
            size={size}
            iconCount={iconCount}
            containerStyle={StyleUtils.getContainerStyles(size)}
            primaryContainerStyle={primaryAvatar.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, primaryAvatar.type)}
            secondaryContainerStyle={[
                StyleUtils.getBackgroundAndBorderStyle(theme.componentBG),
                secondaryAvatar.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, secondaryAvatar.type),
            ]}
            primary={renderPressableAvatar(primaryAvatar, 'ReportActionAvatars-MultipleAvatars-MainAvatar')}
            secondary={renderPressableAvatar(secondaryAvatar, 'ReportActionAvatars-MultipleAvatars-SecondaryAvatar')}
        />
    );
}

export default PressableDiagonalAvatars;
