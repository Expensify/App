import Text from '@components/Text';
import BaseListItem from './BaseListItem';
import {CardRuleListItemProps, CardRuleListItemType, ListItem} from './types';

function CardRuleListItem<TItem extends ListItem>({item, onSelectRow}: CardRuleListItemProps<TItem>) {
    const cardRule = item as unknown as CardRuleListItemType;

    return (
        <BaseListItem
            item={item}
            keyForList={item.keyForList}
            onSelectRow={onSelectRow}
            showTooltip={false}
        >
            <Text>Hello World</Text>
        </BaseListItem>
    );
}

export default CardRuleListItem;
