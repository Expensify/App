import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
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
            <View>
                {cardRule.summaryParts.map((part) => (
                    <View
                        key={part.text}
                        style={[styles.flexRow, styles.gap2, styles.alignItemsStart, styles.mb2]}
                    >
                        <Badge
                            text={part.badgeLabel}
                            badgeStyles={[styles.ml0, styles.justifyContentCenter, getMinimumWidth(40)]}
                            error={!part.isNeutral && isBlockingRule}
                            success={!part.isNeutral && !isBlockingRule}
                            isCondensed
                        />
                        <Text
                            style={[styles.flex1, styles.flexShrink1, styles.themeTextColor]}
                            numberOfLines={2}
                        >
                            {part.text}
                        </Text>
                    </View>
                ))}
                <Text
                    style={[styles.textLabelSupporting, styles.fontSizeLabel]}
                    numberOfLines={2}
                >
                    {cardRule.summary}
                </Text>
            </View>
        </BaseListItem>
    );
}

export default CardRuleListItem;
