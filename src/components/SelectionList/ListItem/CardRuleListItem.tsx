import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Checkbox from '@components/Checkbox';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import {CardRuleListItemProps, CardRuleListItemType, ListItem} from './types';

function CardRuleListItem<TItem extends ListItem>({item, onSelectRow}: CardRuleListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {getMinimumWidth} = useStyleUtils();

    const cardRule = item as unknown as CardRuleListItemType;
    const isBlockingRule = cardRule.action === CONST.SPEND_RULES.ACTION.BLOCK;

    return (
        <BaseListItem
            item={item}
            keyForList={item.keyForList}
            onSelectRow={onSelectRow}
            showTooltip={false}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pv3]}>
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

                <Checkbox
                    shouldSelectOnPressEnter
                    containerBorderRadius={999}
                    accessibilityLabel="CardRuleListItem"
                    isChecked={item.isSelected}
                    onPress={() => onSelectRow(item)}
                />
            </View>
        </BaseListItem>
    );
}

export default CardRuleListItem;
