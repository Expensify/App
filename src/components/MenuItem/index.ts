/**
 * MenuItem — single entry point for both the legacy monolith and the compound API.
 *
 * The default export is the legacy `MenuItem` (so the existing `@components/MenuItem`
 * imports keep working), extended with the compound sub-components following the
 * composition-over-configuration pattern.
 *
 * The row's accessibility label is derived from the text leaves, announced top line first.
 *
 * @example Simple navigation row
 * ```tsx
 * import MenuItem from '@components/MenuItem';
 *
 * <MenuItem.Root onPress={onNavigate}>
 *     <MenuItem.Row>
 *         <MenuItem.Leading>
 *             <MenuItem.Icon src={icons.Gear} />
 *         </MenuItem.Leading>
 *         <MenuItem.Content>
 *             <MenuItem.FieldValue>{translate('common.settings')}</MenuItem.FieldValue>
 *         </MenuItem.Content>
 *         <MenuItem.Trailing>
 *             <MenuItem.Chevron />
 *         </MenuItem.Trailing>
 *     </MenuItem.Row>
 * </MenuItem.Root>
 * ```
 *
 * @example Form field row — the top line names the field, the bottom line holds its value
 * ```tsx
 * <MenuItem.Root onPress={onEdit}>
 *     <MenuItem.Row>
 *         <MenuItem.Content>
 *             <MenuItem.FieldName>{translate('common.role')}</MenuItem.FieldName>
 *             <MenuItem.FieldValue>{role}</MenuItem.FieldValue>
 *         </MenuItem.Content>
 *         <MenuItem.Trailing>
 *             <MenuItem.Chevron />
 *         </MenuItem.Trailing>
 *     </MenuItem.Row>
 * </MenuItem.Root>
 * ```
 */
import MenuItemContent from './layout/MenuItemContent';
import MenuItemLeading from './layout/MenuItemLeading';
import MenuItemRoot from './layout/MenuItemRoot';
import MenuItemRow from './layout/MenuItemRow';
import MenuItemTrailing from './layout/MenuItemTrailing';
import MenuItemIcon from './leaves/leading/MenuItemIcon';
import MenuItemDescription from './leaves/text/MenuItemDescription';
import MenuItemFieldName from './leaves/text/MenuItemFieldName';
import MenuItemFieldNamePlaceholder from './leaves/text/MenuItemFieldNamePlaceholder';
import MenuItemFieldValue from './leaves/text/MenuItemFieldValue';
import MenuItemTitle from './leaves/text/MenuItemTitle';
import MenuItemChevron from './leaves/trailing/MenuItemChevron';
import MenuItemRightLabel from './leaves/trailing/MenuItemRightLabel';
import LegacyMenuItem from './MenuItem';

const MenuItem = Object.assign(LegacyMenuItem, {
    Root: MenuItemRoot,
    Row: MenuItemRow,
    Leading: MenuItemLeading,
    Content: MenuItemContent,
    Trailing: MenuItemTrailing,
    Icon: MenuItemIcon,
    Title: MenuItemTitle,
    Description: MenuItemDescription,
    FieldName: MenuItemFieldName,
    FieldNamePlaceholder: MenuItemFieldNamePlaceholder,
    FieldValue: MenuItemFieldValue,
    Chevron: MenuItemChevron,
    RightLabel: MenuItemRightLabel,
});

export default MenuItem;
export type {MenuItemBaseProps, MenuItemProps} from './MenuItem';
