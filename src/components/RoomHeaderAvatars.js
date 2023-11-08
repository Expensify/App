import PropTypes from 'prop-types';
import React, {memo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Navigation from '@libs/Navigation/Navigation';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import Avatar from './Avatar';
import avatarPropTypes from './avatarPropTypes';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import Text from './Text';

const propTypes = {
    icons: PropTypes.arrayOf(avatarPropTypes),
    reportID: PropTypes.string,
};

const defaultProps = {
    icons: [],
    reportID: '',
};

function RoomHeaderAvatars(props) {
    const navigateToAvatarPage = (icon) => {
        if (icon.type === CONST.ICON_TYPE_WORKSPACE) {
            Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(props.reportID));
            return;
        }
        Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(icon.id));
    };

    if (!props.icons.length) {
        return null;
    }

    if (props.icons.length === 1) {
        return (
            <PressableWithoutFocus
                style={[styles.noOutline]}
                onPress={() => navigateToAvatarPage(props.icons[0])}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={props.icons[0].name}
            >
                <Avatar
                    source={props.icons[0].source}
                    imageStyles={[styles.avatarLarge]}
                    fill={themeColors.iconSuccessFill}
                    size={CONST.AVATAR_SIZE.LARGE}
                    name={props.icons[0].name}
                    type={props.icons[0].type}
                    fallbackIcon={props.icons[0].fallbackIcon}
                />
            </PressableWithoutFocus>
        );
    }

    const iconsToDisplay = props.icons.slice(0, CONST.REPORT.MAX_PREVIEW_AVATARS);

    const iconStyle = [
        styles.roomHeaderAvatar,

        // Due to border-box box-sizing, the Avatars have to be larger when bordered to visually match size with non-bordered Avatars
        StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.LARGE_BORDERED),
    ];
    return (
        <View style={styles.pointerEventsBoxNone}>
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {_.map(iconsToDisplay, (icon, index) => (
                    <View
                        key={`${icon.id}${index}`}
                        style={[styles.justifyContentCenter, styles.alignItemsCenter]}
                    >
                        <PressableWithoutFocus
                            style={[styles.mln4, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                            onPress={() => navigateToAvatarPage(icon)}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                            accessibilityLabel={icon.name}
                        >
                            <Avatar
                                source={icon.source}
                                fill={themeColors.iconSuccessFill}
                                size={CONST.AVATAR_SIZE.LARGE}
                                containerStyles={[...iconStyle, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                                name={icon.name}
                                type={icon.type}
                                fallbackIcon={icon.fallbackIcon}
                            />
                        </PressableWithoutFocus>
                        {index === CONST.REPORT.MAX_PREVIEW_AVATARS - 1 && props.icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS !== 0 && (
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
                                <Text style={styles.avatarInnerTextChat}>{`+${props.icons.length - CONST.REPORT.MAX_PREVIEW_AVATARS}`}</Text>
                            </>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

RoomHeaderAvatars.defaultProps = defaultProps;
RoomHeaderAvatars.propTypes = propTypes;
RoomHeaderAvatars.displayName = 'RoomHeaderAvatars';

export default memo(RoomHeaderAvatars);
