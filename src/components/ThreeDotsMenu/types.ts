import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {TranslationPaths} from '@src/languages/types';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';

type ThreeDotsMenuProps = {
    /** Tooltip for the popup icon */
    iconTooltip?: TranslationPaths;

    /** icon for the popup trigger */
    icon?: IconAsset;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Function to call on icon press */
    onIconPress?: (() => void) | ((e?: GestureResponderEvent | KeyboardEvent | undefined) => void);

    /** menuItems that'll show up on toggle of the popup menu */
    menuItems: PopoverMenuItem[];

    /** The anchor alignment of the menu */
    anchorAlignment?: AnchorAlignment;

    /** Whether the popover menu should overlay the current view */
    shouldOverlay?: boolean;

    /** Whether the menu is disabled */
    disabled?: boolean;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;

    /** Function to hide the product training tooltip */
    hideProductTrainingTooltip?: () => void;

    /** Tooltip content to render */
    renderProductTrainingTooltipContent?: () => React.JSX.Element;

    /** Should we render the tooltip */
    shouldShowProductTrainingTooltip?: boolean;

    /** Is the menu nested? This prop is used to omit html warning when we are nesting a button inside another button */
    isNested?: boolean;

    /** Ref to the menu */
    threeDotsMenuRef?: React.RefObject<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean} | null>;
};

type ThreeDotsMenuWithOptionalAnchorProps =
    | (ThreeDotsMenuProps & {
          /** The anchor position of the menu */
          anchorPosition: AnchorPosition;

          /** A callback to get the anchor position dynamically */
          getAnchorPosition?: never;

          /** Whether the three dot menu handles its positioning logic internally. */
          shouldSelfPosition?: false;
      })
    | (ThreeDotsMenuProps & {
          /** The anchor position of the menu */
          anchorPosition?: never;

          /** A callback to get the anchor position dynamically */
          getAnchorPosition: () => Promise<AnchorPosition>;

          /** Whether the three dot menu handles its positioning logic internally. */
          shouldSelfPosition?: false;
      })
    | (ThreeDotsMenuProps & {
          /** The anchor position of the menu */
          anchorPosition?: never;

          /** A callback to get the anchor position dynamically */
          getAnchorPosition?: never;

          /** Whether the three dot menu handles its positioning logic internally. */
          shouldSelfPosition: true;
      });

export default ThreeDotsMenuWithOptionalAnchorProps;
