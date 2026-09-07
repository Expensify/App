/**
 * MenuItem — single entry point for both the legacy monolith and the compound API.
 *
 * The default export is the legacy `MenuItem` (so the existing `@components/MenuItem`
 * imports keep working), extended with the compound sub-components following the
 * composition-over-configuration pattern.
 *
 * The row's accessibility label is derived from the `Title`/`Description` text, followed by the
 * hints trailing leaves register.
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
 *             <MenuItem.Title>{translate('common.settings')}</MenuItem.Title>
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
import MenuItemDescription from './leaves/text/description/MenuItemDescription';
import MenuItemDescriptionPlaceholder from './leaves/text/description/MenuItemDescriptionPlaceholder';
import MenuItemTitle from './leaves/text/MenuItemTitle';
import MenuItemChevron from './leaves/trailing/icons/MenuItemChevron';
import MenuItemNewWindowIcon from './leaves/trailing/icons/MenuItemNewWindowIcon';
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
    DescriptionPlaceholder: MenuItemDescriptionPlaceholder,
    Chevron: MenuItemChevron,
    NewWindowIcon: MenuItemNewWindowIcon,
    RightLabel: MenuItemRightLabel,
});

export default MenuItem;
export type {MenuItemBaseProps, MenuItemProps} from './MenuItem';
