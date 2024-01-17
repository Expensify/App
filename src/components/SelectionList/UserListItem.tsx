import React from 'react';
import {View} from 'react-native';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import type {UserListItemProps} from './types';

function UserListItem({item, textStyles, alternateTextStyles, showTooltip, style}: UserListItemProps) {
    const styles = useThemeStyles();
    return (
        <>
            {!!item.icons && (
                <SubscriptAvatar
                    mainAvatar={item.icons[0]}
                    secondaryAvatar={item.icons[1]}
                    showTooltip={showTooltip}
                />
            )}
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.optionRow]}>
                <Tooltip
                    shouldRender={showTooltip}
                    text={item.text}
                >
                    <Text
                        style={[textStyles, style]}
                        numberOfLines={1}
                    >
                        {item.text}
                    </Text>
                </Tooltip>
                {!!item.alternateText && (
                    <Tooltip
                        shouldRender={showTooltip}
                        text={item.alternateText}
                    >
                        <Text
                            style={[alternateTextStyles, style]}
                            numberOfLines={1}
                        >
                            {item.alternateText}
                        </Text>
                    </Tooltip>
                )}
            </View>
            {!!item.rightElement && item.rightElement}
        </>
    );
}

UserListItem.displayName = 'UserListItem';

export default UserListItem;
