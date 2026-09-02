import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useExpandCollapseAnimation from '@hooks/useExpandCollapseAnimation';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import type {GroupChildrenContentProps} from './types';

import GroupChildrenContent from './GroupChildrenContent';
import {useGroupCheckboxState} from './useGroupChildren';

type GroupChildrenContainerProps = GroupChildrenContentProps & {
    isFirstItem?: boolean;
    isLastItem?: boolean;
};

function GroupChildrenContainer({
    item,
    isExpanded,
    groupBy,
    searchType,
    columns,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onLongPressRow,
    nonPersonalAndWorkspaceCards,
    onUndelete,
    isFirstItem = false,
    isLastItem,
    newTransactionID,
}: GroupChildrenContainerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const hasBorder = !isFirstItem;
    const {isRendered, animatedStyle, onLayout} = useExpandCollapseAnimation(isExpanded, isExpanded && hasBorder, item.keyForList);
    const isContentVisible = isExpanded || isRendered;
    const {isSelectAllChecked} = useGroupCheckboxState({groupKey: item.groupKeyForList, groupTransactions: item.transactions});

    // Only the rows this container holds decide its background, so a group still waiting for its first page is not painted as selected.
    const isSelected = !!item.isSelected || (item.transactions.length > 0 && isSelectAllChecked);

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles: false,
    });

    // Rendering null in FlashList can cause heavy first-render work; use an empty placeholder instead (LHN pattern).
    if (!isExpanded && !isRendered) {
        return <View />;
    }

    return (
        <Animated.View
            style={[
                styles.mh5,
                {backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG},
                animatedHighlightStyle,
                isLastItem && [styles.tableBottomRadius, styles.overflowHidden],
                hasBorder && styles.tableBorder,
            ]}
        >
            <Animated.View style={animatedStyle}>
                {isContentVisible ? (
                    <Animated.View
                        style={[styles.stickToTop, styles.pb1]}
                        onLayout={onLayout}
                    >
                        <GroupChildrenContent
                            item={item}
                            isExpanded={isContentVisible}
                            groupBy={groupBy}
                            searchType={searchType}
                            columns={columns}
                            canSelectMultiple={canSelectMultiple}
                            onSelectRow={onSelectRow}
                            onCheckboxPress={onCheckboxPress}
                            onLongPressRow={onLongPressRow}
                            nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                            onUndelete={onUndelete}
                            newTransactionID={newTransactionID}
                        />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
}

export default GroupChildrenContainer;
