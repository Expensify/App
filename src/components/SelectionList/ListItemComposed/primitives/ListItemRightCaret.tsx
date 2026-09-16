import Icon from '@components/Icon';
import {useListItemContext, useListItemHovered} from '@components/SelectionList/ListItemContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import React from 'react';
import {View} from 'react-native';

/** Right caret icon whose fill follows the row's hover/disabled/interactive state from context. */
function ListItemRightCaret() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const isHovered = useListItemHovered();
    const {isDisabled, isInteractive} = useListItemContext();

    return (
        <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, isDisabled && styles.cursorDisabled]}>
            <Icon
                src={icons.ArrowRight}
                fill={StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: isHovered, isDisabled, isInteractive})})}
            />
        </View>
    );
}

export default ListItemRightCaret;
