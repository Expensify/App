import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import Text from '../Text';
import {userListItemPropTypes} from './selectionListPropTypes';
import Tooltip from '../Tooltip';
import SubscriptAvatar from '../SubscriptAvatar';

function UserListItem({item, isFocused = false, showTooltip}) {
    const avatar = (
        <SubscriptAvatar
            mainAvatar={lodashGet(item, 'icons[0]')}
            secondaryAvatar={lodashGet(item, 'icons[1]')}
            showTooltip={showTooltip}
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
            {Boolean(item.icons) && avatar}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.optionRow]}>
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
