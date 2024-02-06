import React, {useMemo} from 'react';
import {View} from 'react-native';
import SubscriptAvatar from '@components/SubscriptAvatar';
import TextWithTooltip from '@components/TextWithTooltip';
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
                <TextWithTooltip
                    shouldShowTooltip={showTooltip}
                    text={item.text}
                    textStyles={[textStyles, style]}
                />
                {!!item.alternateText && (
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip}
                        text={item.alternateText}
                        textStyles={[alternateTextStyles, style]}
                    />
                )}
            </View>
            {!!item.rightElement && item.rightElement}
        </>
    );
}

UserListItem.displayName = 'UserListItem';

export default UserListItem;
