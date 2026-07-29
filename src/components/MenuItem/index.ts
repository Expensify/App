/**
 * MenuItem — single entry point for both the legacy monolith and the compound API.
 *
 * The default export is the legacy `MenuItem` (so the existing `@components/MenuItem`
 * imports keep working), extended with the compound sub-components following the
 * composition-over-configuration pattern.
 *
 * The row's accessibility label is derived from the `Title`/`Description` text, in render order.
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
import MenuItemTitle from './leaves/text/MenuItemTitle';
import MenuItemChevron from './leaves/trailing/MenuItemChevron';
import LegacyMenuItem from './MenuItem';
import MenuItemStandard from './presets/MenuItemStandard';

type MenuItemType = {
    /** The legacy monolithic MenuItem */
    (...props: Parameters<typeof LegacyMenuItem>): ReturnType<typeof LegacyMenuItem>;

    /** Standard preset — tappable, icon, title and optional description/chevron */
    Standard: typeof MenuItemStandard;

    /** The compound root — a pressable row sharing interaction state with the sub-components below */
    Root: typeof MenuItemRoot;

    /** The main horizontal line holding the leading, content and trailing cells */
    Row: typeof MenuItemRow;

    /** The flexible middle cell — stacks Title/Description (in any order) vertically */
    Content: typeof MenuItemContent;

    /** The right-side cluster for indicators and actions */
    Trailing: typeof MenuItemTrailing;

    /** Leading icon whose fill follows the row's interaction state */
    Icon: typeof MenuItemIcon;

    /** The (bold) title text */
    Title: typeof MenuItemTitle;

    /** The supporting description text — above or below the title depending on declaration order */
    Description: typeof MenuItemDescription;

    /** Right arrow navigation indicator, dimmed until hovered */
    Chevron: typeof MenuItemChevron;
};

const MenuItem: MenuItemType = Object.assign(LegacyMenuItem, {
    Standard: MenuItemStandard,
    Root: MenuItemRoot,
    Row: MenuItemRow,
    Content: MenuItemContent,
    Trailing: MenuItemTrailing,
    Icon: MenuItemIcon,
    Title: MenuItemTitle,
    Description: MenuItemDescription,
    Chevron: MenuItemChevron,
});

export default MenuItem;
export type {MenuItemBaseProps, MenuItemProps} from './MenuItem';
