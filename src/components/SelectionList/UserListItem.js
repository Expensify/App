import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@styles/useThemeStyles';
import {userListItemPropTypes} from './selectionListPropTypes';

function UserListItem({item, isFocused = false, showTooltip}) {
    const styles = useThemeStyles();
    return (
        <>
            {Boolean(item.icons) && (
                <SubscriptAvatar
                    mainAvatar={lodashGet(item, 'icons[0]')}
                    secondaryAvatar={lodashGet(item, 'icons[1]')}
                    showTooltip={showTooltip}
                />
            )}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.optionRow]}>
                <Tooltip
                    shouldRender={showTooltip}
                    text={item.text}
                >
                    <Text
                        style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold]}
                        numberOfLines={1}
                    >
                        {item.text}
                    </Text>
                </Tooltip>
                {Boolean(item.alternateText) && (
                    <Tooltip
                        shouldRender={showTooltip}
                        text={item.alternateText}
                    >
                        <Text
                            style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                            numberOfLines={1}
                        >
                            {item.alternateText}
                        </Text>
                    </Tooltip>
                )}
            </View>
            {Boolean(item.rightElement) && item.rightElement}
        </>
    );
}

UserListItem.displayName = 'UserListItem';
UserListItem.propTypes = userListItemPropTypes;

export default UserListItem;
