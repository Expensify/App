/**
 * ListItem – composed building blocks for SelectionList row content.
 *
 * @example
 * ```tsx
 * import ListItem from '@components/SelectionList/ListItemComposed';
 *
 * <ListItem.Pressable item={item} onSelectRow={onSelectRow} keyForList={item.keyForList} showTooltip>
 *   <View style={[styles.flexRow, styles.flex1]}>
 *     <ListItem.Title text={name} />
 *     <ListItem.Subtitle text={subtitle} />
 *   </View>
 * </ListItem.Pressable>
 * ```
 *
 * Note: the Onyx data type is also named `ListItem`. In variant files that use both, import this module as
 * `ListItemComposed` to avoid the name collision.
 */
import type React from 'react';

import ListItemPressable from './ListItemPressable';
import ListItemRBRIndicator from './primitives/ListItemRBRIndicator';
import ListItemSubtitle from './primitives/ListItemSubtitle';
import ListItemTitle from './primitives/ListItemTitle';

function ListItemRoot({children}: {children?: React.ReactNode}) {
    return children ?? null;
}

const ListItem = Object.assign(ListItemRoot, {
    Pressable: ListItemPressable,
    Title: ListItemTitle,
    Subtitle: ListItemSubtitle,
    RBRIndicator: ListItemRBRIndicator,
});

export default ListItem;
export {default as useListItemHighlight} from './hooks/useListItemHighlight';
