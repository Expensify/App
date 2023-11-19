import PropTypes from 'prop-types';
import React, {memo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as UserUtils from '@libs/UserUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import AttachmentModal from './AttachmentModal';
import Avatar from './Avatar';
import avatarPropTypes from './avatarPropTypes';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import Text from './Text';

const propTypes = {
    icons: PropTypes.arrayOf(avatarPropTypes),
};

const defaultProps = {
    icons: [],
};

function RoomHeaderAvatars(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    if (!props.icons.length) {
        return null;
    }

    if (props.icons.length === 1) {
        return (
            <AttachmentModal
                headerTitle={props.icons[0].name}
                source={UserUtils.getFullSizeAvatar(props.icons[0].source, props.icons[0].id)}
                isAuthTokenRequired
                isWorkspaceAvatar={props.icons[0].type === CONST.ICON_TYPE_WORKSPACE}
                originalFileName={props.icons[0].name}
            >
                {({show}) => (
                    <PressableWithoutFocus
                        style={[styles.noOutline]}
                        onPress={show}
                        role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                        accessibilityLabel={props.icons[0].name}
                    >
                        <Avatar
                            source={props.icons[0].source}
                            imageStyles={[styles.avatarLarge]}
                            fill={theme.iconSuccessFill}
                            size={CONST.AVATAR_SIZE.LARGE}
                            name={props.icons[0].name}
                            type={props.icons[0].type}
                            fallbackIcon={props.icons[0].fallbackIcon}
                        />
                    </PressableWithoutFocus>
                )}
            </AttachmentModal>
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
                        <AttachmentModal
                            headerTitle={icon.name}
                            source={UserUtils.getFullSizeAvatar(icon.source, icon.id)}
                            isAuthTokenRequired
                            originalFileName={icon.name}
                            isWorkspaceAvatar={icon.type === CONST.ICON_TYPE_WORKSPACE}
                        >
                            {({show}) => (
                                <PressableWithoutFocus
                                    style={[styles.mln4, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                                    onPress={show}
                                    role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                    accessibilityLabel={icon.name}
                                >
                                    <Avatar
                                        source={icon.source}
                                        fill={theme.iconSuccessFill}
                                        size={CONST.AVATAR_SIZE.LARGE}
                                        containerStyles={[...iconStyle, StyleUtils.getAvatarBorderRadius(CONST.AVATAR_SIZE.LARGE_BORDERED, icon.type)]}
                                        name={icon.name}
                                        type={icon.type}
                                        fallbackIcon={icon.fallbackIcon}
                                    />
                                </PressableWithoutFocus>
                            )}
                        </AttachmentModal>
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
