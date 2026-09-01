/**
 * MenuItem — single entry point for both the legacy monolith and the compound API.
 *
 * The default export is the legacy `MenuItem` (so the existing `@components/MenuItem`
 * imports keep working), extended with the compound sub-components following the
 * composition-over-configuration pattern.
 *
 * The row's accessibility label is derived from the `Title`/`Description` text.
 *
 * @example Simple navigation row
 * ```tsx
 * import MenuItem from '@components/MenuItem';
 *
 * <MenuItem.Root onPress={onNavigate}>
 *     <MenuItem.Row>
 *         <MenuItem.Icon src={icons.Gear} />
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
import MenuItemRoot from './layout/MenuItemRoot';
import MenuItemRow from './layout/MenuItemRow';
import MenuItemTrailing from './layout/MenuItemTrailing';
import MenuItemIcon from './leaves/leading/MenuItemIcon';
import MenuItemDescription from './leaves/text/MenuItemDescription';
import MenuItemTitle from './leaves/text/title/MenuItemTitle';
import MenuItemTitleBasic from './leaves/text/title/MenuItemTitleBasic';
import MenuItemTitlePlaceholder from './leaves/text/title/MenuItemTitlePlaceholder';
import MenuItemChevron from './leaves/trailing/MenuItemChevron';
import MenuItemErrorDot from './leaves/trailing/MenuItemErrorDot';
import MenuItemTrailingIcon from './leaves/trailing/MenuItemTrailingIcon';
import LegacyMenuItem from './MenuItem';

const MenuItem = Object.assign(LegacyMenuItem, {
    Root: MenuItemRoot,
    Row: MenuItemRow,
    Content: MenuItemContent,
    Trailing: MenuItemTrailing,
    Icon: MenuItemIcon,
    Title: MenuItemTitle,
    TitleBasic: MenuItemTitleBasic,
    TitlePlaceholder: MenuItemTitlePlaceholder,
    Description: MenuItemDescription,
    Chevron: MenuItemChevron,
    ErrorDot: MenuItemErrorDot,
    TrailingIcon: MenuItemTrailingIcon,
});

export default MenuItem;
export type {MenuItemBaseProps, MenuItemProps} from './MenuItem';
