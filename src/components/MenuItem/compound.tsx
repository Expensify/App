/**
 * MenuItem (compound)
 *
 * A composable decomposition of the classic `MenuItem`, following the composition-over-configuration
 * pattern: instead of ~135 props configuring one monolith, the consumer assembles the row from
 * sub-components and interaction state (hover/press/focus/disabled) is shared through context.
 *
 * @example Simple navigation row
 * ```tsx
 * import MenuItem from '@components/MenuItem/compound';
 *
 * <MenuItem onPress={onNavigate} accessibilityLabel={translate('common.settings')}>
 *     <MenuItem.Row>
 *         <MenuItem.Icon src={icons.Gear} />
 *         <MenuItem.Content>
 *             <MenuItem.Title>{translate('common.settings')}</MenuItem.Title>
 *         </MenuItem.Content>
 *         <MenuItem.Trailing>
 *             <MenuItem.Chevron />
 *         </MenuItem.Trailing>
 *     </MenuItem.Row>
 * </MenuItem>
 * ```
 *
 * @example Field row with a description on top, an error below, and helper text outside the pressable
 * ```tsx
 * <MenuItem onPress={onEdit} accessibilityLabel={`${description}, ${title}`}>
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
 * </MenuItem>
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
import {useMenuItemState} from './MenuItemContext';

const MenuItem = Object.assign(MenuItemRoot, {
    /** The main horizontal line holding the leading, content and trailing cells */
    Row: MenuItemRow,

    /** The flexible middle cell — stacks Title/Description (in any order) vertically */
    Content: MenuItemContent,

    /** The right-side cluster for indicators and actions */
    Trailing: MenuItemTrailing,

    /** Leading icon whose fill follows the row's interaction state */
    Icon: MenuItemIcon,

    /** Leading user/workspace avatar */
    Avatar: MenuItemAvatar,

    /** Small supporting label rendered above the main line */
    Label: MenuItemLabel,

    /** The (bold) title text */
    Title: MenuItemTitle,

    /** The supporting description text — above or below the title depending on declaration order */
    Description: MenuItemDescription,

    /** Badge that follows the row's focused state */
    Badge: MenuItemBadge,

    /** Right arrow (or custom) navigation indicator, dimmed until hovered */
    Chevron: MenuItemChevron,

    /** Right-aligned supporting text (covers legacy `rightLabel` and `subtitle`) */
    RightLabel: MenuItemRightLabel,

    /** Red/green dot signalling the row needs attention */
    BrickRoadIndicator: MenuItemBrickRoadIndicator,

    /** Hover-revealed copy-to-clipboard button (devices with hover support) */
    CopyButton: MenuItemCopyButton,

    /** Error message rendered under the main line (inside the pressable) */
    Error: MenuItemError,

    /** Hint message rendered under the main line (inside the pressable) */
    Hint: MenuItemHint,

    /** Non-interactive helper text — place it AFTER the root, outside the pressable */
    HelperText: MenuItemHelperText,
});

export default MenuItem;
export {useMenuItemState};
export type {MenuItemRootProps} from './layout/MenuItemRoot';
export type {MenuItemState} from './MenuItemContext';
