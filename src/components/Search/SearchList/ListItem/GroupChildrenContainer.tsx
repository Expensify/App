import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import useExpandCollapseAnimation from '@hooks/useExpandCollapseAnimation';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import GroupChildrenContent from './GroupChildrenContent';
import type {GroupChildrenContentProps} from './types';

type GroupChildrenContainerProps = GroupChildrenContentProps & {
    isLastItem?: boolean;
    isSelected?: boolean;
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
    isLastItem,
    isSelected,
    newTransactionID,
    bankAccountList,
    cardFeeds,
    conciergeReportID,
}: GroupChildrenContainerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isRendered, animatedStyle, onLayout} = useExpandCollapseAnimation(isExpanded, false);

    if (!isExpanded && !isRendered) {
        return null;
    }

    return (
        <View style={[styles.mh5, {backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG}, isLastItem && [styles.tableBottomRadius, styles.overflowHidden]]}>
            <Animated.View style={animatedStyle}>
                <Animated.View
                    style={[styles.stickToTop, styles.pb1]}
                    onLayout={onLayout}
                >
                    <GroupChildrenContent
                        item={item}
                        isExpanded={isExpanded}
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
                        bankAccountList={bankAccountList}
                        cardFeeds={cardFeeds}
                        conciergeReportID={conciergeReportID}
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}

export default GroupChildrenContainer;
