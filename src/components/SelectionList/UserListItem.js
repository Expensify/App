import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import Text from '../Text';
import {userListItemPropTypes} from './selectionListPropTypes';
import Avatar from '../Avatar';
import CONST from '../../CONST';
import Tooltip from '../Tooltip';
import UserDetailsTooltip from '../UserDetailsTooltip';

function UserListItem({item, isFocused = false, showTooltip}) {
    const avatar = (
        <Avatar
            containerStyles={styles.pl3}
            source={lodashGet(item, 'avatar.source', '')}
            name={lodashGet(item, 'avatar.name', item.text)}
            type={lodashGet(item, 'avatar.type', CONST.ICON_TYPE_AVATAR)}
        />
    );

    const text = (
        <Text
            style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold]}
            numberOfLines={1}
        >
            {item.text}
        </Text>
    );

    const alternateText = (
        <Text
            style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
            numberOfLines={1}
        >
            {item.alternateText}
        </Text>
    );

    return (
        <>
            {Boolean(item.avatar) &&
                (showTooltip ? (
                    <UserDetailsTooltip
                        accountID={item.accountID}
                        shiftHorizontal={styles.pl5.paddingLeft / 2}
                    >
                        <View>{avatar}</View>
                    </UserDetailsTooltip>
                ) : (
                    avatar
                ))}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.pl3, styles.optionRow]}>
                {showTooltip ? <Tooltip text={item.text}>{text}</Tooltip> : text}
                {Boolean(item.alternateText) && (showTooltip ? <Tooltip text={item.alternateText}>{alternateText}</Tooltip> : alternateText)}
            </View>
            {Boolean(item.rightElement) && item.rightElement}
        </>
    );
}

UserListItem.displayName = 'UserListItem';
UserListItem.propTypes = userListItemPropTypes;

export default UserListItem;
