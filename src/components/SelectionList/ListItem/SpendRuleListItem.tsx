import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Checkbox from '@components/Checkbox';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import type {ListItem, SpendRuleListItemProps, SpendRuleListItemType} from './types';

function SpendRuleListItem<TItem extends ListItem>({item, onSelectRow}: SpendRuleListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {getMinimumWidth} = useStyleUtils();

    const cardRule = item as unknown as SpendRuleListItemType;
    const isBlockingRule = cardRule.action === CONST.SPEND_RULES.ACTION.BLOCK;

    const rightHandSideComponent = () => (
        <Checkbox
            shouldSelectOnPressEnter
            containerBorderRadius={999}
            disabled={!item.isSelected}
            isChecked={!!item.isSelected}
            accessibilityLabel={item.text ?? ''}
            onPress={() => onSelectRow(item)}
        />
    );

    return (
        <BaseListItem
            item={item}
            keyForList={item.keyForList}
            onSelectRow={onSelectRow}
            showTooltip={false}
            rightHandSideComponent={rightHandSideComponent}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.optionRow]}
        >
            <View style={[styles.flexColumn, styles.gap2, styles.flex1]}>
                <Text
                    numberOfLines={2}
                    style={[styles.textLabelSupporting, styles.fontSizeLabel]}
                >
                    {cardRule.summary}
                </Text>

                {cardRule.summaryParts.map((part) => (
                    <View
                        key={part.text}
                        style={[styles.flexRow, styles.gap2, styles.alignItemsStart, styles.mb2]}
                    >
                        <Badge
                            isCondensed
                            text={part.badgeLabel}
                            error={!part.isNeutral && isBlockingRule}
                            success={!part.isNeutral && !isBlockingRule}
                            badgeStyles={[styles.ml0, styles.justifyContentCenter, getMinimumWidth(40)]}
                        />
                        <Text
                            numberOfLines={2}
                            style={[styles.flex1, styles.flexShrink1, styles.themeTextColor]}
                        >
                            {part.text}
                        </Text>
                    </View>
                ))}
            </View>
        </BaseListItem>
    );
}

export default SpendRuleListItem;
