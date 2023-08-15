import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Text from './Text';
import CONST from '../CONST';
import Avatar from './Avatar';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';
import avatarPropTypes from './avatarPropTypes';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import * as UserUtils from '../libs/UserUtils';
import AttachmentModal from './AttachmentModal';

const propTypes = {
    icons: PropTypes.arrayOf(avatarPropTypes),
};

const defaultProps = {
    icons: [],
};

function RoomHeaderAvatars(props) {
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
        <View pointerEvents="box-none">
            <View style={[styles.flexRow, styles.wAuto, styles.ml3]}>
                {_.map(iconsToDisplay, (icon, index) => (
                    <View
                        key={`${icon.source}${index}`}
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
