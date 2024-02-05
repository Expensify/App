import React, {useMemo} from 'react';
import {View} from 'react-native';
import SubscriptAvatar from '@components/SubscriptAvatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {UserListItemProps} from './types';

function UserListItem({item, textStyles, alternateTextStyles, showTooltip, style}: UserListItemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const containerStyles = useMemo(() => StyleUtils.getUserListItemStyles(styles), [StyleUtils, styles]);

    return (
        <>
            {!!item.icons && (
                <SubscriptAvatar
                    mainAvatar={item.icons[0]}
                    secondaryAvatar={item.icons[1]}
                    showTooltip={showTooltip}
                />
            )}
            <View style={containerStyles}>
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
