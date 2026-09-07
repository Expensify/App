/**
 * ListItem – composed building blocks for SelectionList row content.
 *
 * The root component is the pressable interaction core; sub-components compose the row content inside it.
 *
 * @example
 * ```tsx
 * import ListItem from '@components/SelectionList/ListItemComposed';
 *
 * <ListItem item={item} onSelectRow={onSelectRow} shouldShowTooltip>
 *     <View style={[styles.flexRow, styles.flex1]}>
 *         <ListItem.Title text={name} />
 *         <ListItem.Subtitle text={subtitle} />
 *     </View>
 * </ListItem>
 * ```
 *
 * Note: the Onyx data type is also named `ListItem`. In variant files that use both, import this module as
 * `ListItemComposed` to avoid the name collision.
 */
import ListItemPressable from './ListItemPressable';
import ListItemCompactAvatar from './primitives/ListItemCompactAvatar';
import ListItemRBRIndicator from './primitives/ListItemRBRIndicator';
import ListItemRightCaret from './primitives/ListItemRightCaret';
import ListItemSubtitle from './primitives/ListItemSubtitle';
import ListItemTextColumn from './primitives/ListItemTextColumn';
import ListItemTitle from './primitives/ListItemTitle';

const ListItem = Object.assign(ListItemPressable, {
    Title: ListItemTitle,
    Subtitle: ListItemSubtitle,
    RBRIndicator: ListItemRBRIndicator,
    TextColumn: ListItemTextColumn,
    RightCaret: ListItemRightCaret,
    CompactAvatar: ListItemCompactAvatar,
});

export default ListItem;
export {default as useListItemHighlight} from './hooks/useListItemHighlight';
