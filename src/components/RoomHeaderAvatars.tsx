import React, {memo} from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import Avatar from './Avatar';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import Text from './Text';

type RoomHeaderAvatarsProps = {
    icons: Icon[];
    reportID: string;
};

function RoomHeaderAvatars({icons, reportID}: RoomHeaderAvatarsProps) {
    const navigateToAvatarPage = (icon: Icon) => {
        if (icon.type === CONST.ICON_TYPE_WORKSPACE) {
            Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(reportID));
            return;
        }

        if (icon.id) {
            Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(icon.id));
        }
    };

    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    if (!icons.length) {
        return null;
    }

    if (icons.length === 1) {
        return (
            <PressableWithoutFocus
                style={styles.noOutline}
                onPress={() => navigateToAvatarPage(icons[0])}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={icons[0].name ?? ''}
            >
                <Avatar
                    source={icons[0].source}
                    imageStyles={styles.avatarLarge}
                    size={CONST.AVATAR_SIZE.LARGE}
                    name={icons[0].name}
                    accountID={icons[0].id}
                    type={icons[0].type}
                    fallbackIcon={icons[0].fallbackIcon}
                />
            </PressableWithoutFocus>
        );
    }

    const iconsToDisplay = icons.slice(0, CONST.REPORT.MAX_PREVIEW_AVATARS);

    const iconStyle = [
        styles.roomHeaderAvatar,

        // Due to border-box box-sizing, the Avatars have to be larger when bordered to visually match size with non-bordered Avatars
        StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.LARGE_BORDERED),
    ];
    return (
        <View style={styles.pointerEventsBoxNone}>
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {iconsToDisplay.map((icon, index) => (
                    <View
                        // eslint-disable-next-line react/no-array-index-key
                        key={`${icon.id}${index}`}
                        style={[styles.justifyContentCenter, styles.alignItemsCenter]}
                    >
                        <PressableWithoutFocus
                            style={[styles.mln4, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                            onPress={() => navigateToAvatarPage(icon)}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                            accessibilityLabel={icon.name ?? ''}
                        >
                            <Avatar
                                source={icon.source}
                                size={CONST.AVATAR_SIZE.LARGE}
                                containerStyles={[...iconStyle, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                                name={icon.name}
                                accountID={icon.id}
                                type={icon.type}
                                fallbackIcon={icon.fallbackIcon}
                            />
                        </PressableWithoutFocus>
                        {index === CONST.REPORT.MAX_PREVIEW_AVATARS - 1 && icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS !== 0 && (
                            <>
                                <View
                                    style={[
                                        styles.roomHeaderAvatarSize,
                                        styles.roomHeaderAvatar,
                                        styles.mln4,
                                        ...iconStyle,
                                        StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type),
                                        styles.roomHeaderAvatarOverlay,
                                    ]}
                                />
                                <Text style={styles.avatarInnerTextChat}>{`+${icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS}`}</Text>
                            </>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

RoomHeaderAvatars.displayName = 'RoomHeaderAvatars';

export default memo(RoomHeaderAvatars);
