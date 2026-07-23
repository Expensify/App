/**
 * MenuItem — single entry point for both the legacy monolith and the compound API.
 *
 * The default export is the legacy `MenuItem` (so the ~120 existing `@components/MenuItem`
 * imports keep working), extended with the compound sub-components following the
 * composition-over-configuration pattern: instead of ~135 props configuring one monolith,
 * the consumer assembles the row from sub-components and interaction state
 * (hover/press/focus/disabled) is shared through context.
 *
 * New code should use the compound API. Once the migration is finished the legacy component
 * will be deleted and only the compound API will remain — the import path and the
 * `MenuItem.Root` / `MenuItem.*` call sites below will not change.
 *
 * @example Simple navigation row
 * ```tsx
 * import MenuItem from '@components/MenuItem';
 *
 * <MenuItem.Root onPress={onNavigate} accessibilityLabel={translate('common.settings')}>
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
 *
 * @example Field row with a description on top, an error below, and helper text outside the pressable
 * ```tsx
 * <MenuItem.Root onPress={onEdit} accessibilityLabel={`${description}, ${title}`}>
 *     <MenuItem.Row>
 *         <MenuItem.Content>
 *             <MenuItem.Description>{description}</MenuItem.Description>
 *             <MenuItem.Title>{title}</MenuItem.Title>
 *         </MenuItem.Content>
 *         <MenuItem.Trailing>
 *             <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
 *             <MenuItem.Chevron />
 *         </MenuItem.Trailing>
 *     </MenuItem.Row>
 *     <MenuItem.Error>{errorText}</MenuItem.Error>
 * </MenuItem.Root>
 * <MenuItem.HelperText>{helperText}</MenuItem.HelperText>
 * ```
 *
 * See README.md in this directory for the full design notes and the legacy-prop → composition mapping.
 */
import MenuItemContent from './layout/MenuItemContent';
import MenuItemRoot from './layout/MenuItemRoot';
import MenuItemRow from './layout/MenuItemRow';
import MenuItemTrailing from './layout/MenuItemTrailing';
import MenuItemAvatar from './leaves/leading/MenuItemAvatar';
import MenuItemIcon from './leaves/leading/MenuItemIcon';
import MenuItemError from './leaves/messages/MenuItemError';
import MenuItemHelperText from './leaves/messages/MenuItemHelperText';
import MenuItemHint from './leaves/messages/MenuItemHint';
import MenuItemDescription from './leaves/text/MenuItemDescription';
import MenuItemLabel from './leaves/text/MenuItemLabel';
import MenuItemTitle from './leaves/text/MenuItemTitle';
import MenuItemBadge from './leaves/trailing/MenuItemBadge';
import MenuItemBrickRoadIndicator from './leaves/trailing/MenuItemBrickRoadIndicator';
import MenuItemChevron from './leaves/trailing/MenuItemChevron';
import MenuItemCopyButton from './leaves/trailing/MenuItemCopyButton';
import MenuItemRightLabel from './leaves/trailing/MenuItemRightLabel';
import LegacyMenuItem from './MenuItem';
import {useMenuItemState} from './MenuItemContext';

type MenuItemType = {
    /**
     * The legacy monolithic MenuItem.
     *
     * @deprecated Use the compound API instead — `MenuItem.Root` with the `MenuItem.*` sub-components.
     */
    (...props: Parameters<typeof LegacyMenuItem>): ReturnType<typeof LegacyMenuItem>;

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

    /** Leading user/workspace avatar */
    Avatar: typeof MenuItemAvatar;

    /** Small supporting label rendered above the main line */
    Label: typeof MenuItemLabel;

    /** The (bold) title text */
    Title: typeof MenuItemTitle;

    /** The supporting description text — above or below the title depending on declaration order */
    Description: typeof MenuItemDescription;

    /** Badge that follows the row's focused state */
    Badge: typeof MenuItemBadge;

    /** Right arrow (or custom) navigation indicator, dimmed until hovered */
    Chevron: typeof MenuItemChevron;

    /** Right-aligned supporting text (covers legacy `rightLabel` and `subtitle`) */
    RightLabel: typeof MenuItemRightLabel;

    /** Red/green dot signalling the row needs attention */
    BrickRoadIndicator: typeof MenuItemBrickRoadIndicator;

    /** Hover-revealed copy-to-clipboard button (devices with hover support) */
    CopyButton: typeof MenuItemCopyButton;

    /** Error message rendered under the main line (inside the pressable) */
    Error: typeof MenuItemError;

    /** Hint message rendered under the main line (inside the pressable) */
    Hint: typeof MenuItemHint;

    /** Non-interactive helper text — place it AFTER the root, outside the pressable */
    HelperText: typeof MenuItemHelperText;
};

const MenuItem: MenuItemType = Object.assign(LegacyMenuItem, {
    Root: MenuItemRoot,
    Row: MenuItemRow,
    Content: MenuItemContent,
    Trailing: MenuItemTrailing,
    Icon: MenuItemIcon,
    Avatar: MenuItemAvatar,
    Label: MenuItemLabel,
    Title: MenuItemTitle,
    Description: MenuItemDescription,
    Badge: MenuItemBadge,
    Chevron: MenuItemChevron,
    RightLabel: MenuItemRightLabel,
    BrickRoadIndicator: MenuItemBrickRoadIndicator,
    CopyButton: MenuItemCopyButton,
    Error: MenuItemError,
    Hint: MenuItemHint,
    HelperText: MenuItemHelperText,
});

export default MenuItem;
export {useMenuItemState};
export type {MenuItemBaseProps, MenuItemProps} from './MenuItem';
export type {MenuItemRootProps} from './layout/MenuItemRoot';
export type {MenuItemState} from './MenuItemContext';
