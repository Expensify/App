import type {PopoverMenuItem} from '@components/PopoverMenu';

import type {TranslationPaths} from '@src/languages/types';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

type ThreeDotsMenuProps = WithSentryLabel & {
    /** Tooltip for the popup icon */
    iconTooltip?: TranslationPaths;

    /** icon for the popup trigger */
    icon?: IconAsset;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** Hover style applied to the trigger (e.g. a ghost-button background). */
    iconHoverStyle?: StyleProp<ViewStyle>;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** The width of the trigger icon. Defaults to the standard icon size. */
    iconWidth?: number;

    /** The height of the trigger icon. Defaults to the standard icon size. */
    iconHeight?: number;

    /** Whether the trigger icon turns green while the menu is open. Defaults to true. */
    shouldChangeFillOnOpen?: boolean;

    testID?: string;
    onIconPress?: (() => void) | ((e?: GestureResponderEvent | KeyboardEvent | undefined) => void);

    /** menuItems that'll show up on toggle of the popup menu */
    menuItems: PopoverMenuItem[];

    anchorAlignment?: AnchorAlignment;

    /** Whether the popover menu should overlay the current view */
    shouldOverlay?: boolean;

    disabled?: boolean;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;

    hideProductTrainingTooltip?: () => void;
    renderProductTrainingTooltipContent?: () => React.JSX.Element;
    shouldShowProductTrainingTooltip?: boolean;

    /** Is the menu nested? This prop is used to omit html warning when we are nesting a button inside another button */
    isNested?: boolean;

    threeDotsMenuRef?: React.RefObject<{hidePopoverMenu: () => void; isPopupMenuVisible: boolean} | null>;
    isContainerFocused?: boolean;
};

type ThreeDotsMenuWithOptionalAnchorProps =
    | (ThreeDotsMenuProps & {
          anchorPosition: AnchorPosition;

          /** A callback to get the anchor position dynamically */
          getAnchorPosition?: never;

          /** Whether the three dot menu handles its positioning logic internally. */
          shouldSelfPosition?: false;
      })
    | (ThreeDotsMenuProps & {
          anchorPosition?: never;

          /** A callback to get the anchor position dynamically */
          getAnchorPosition: () => Promise<AnchorPosition>;

          /** Whether the three dot menu handles its positioning logic internally. */
          shouldSelfPosition?: false;
      })
    | (ThreeDotsMenuProps & {
          anchorPosition?: never;

          /** A callback to get the anchor position dynamically */
          getAnchorPosition?: never;

          /** Whether the three dot menu handles its positioning logic internally. */
          shouldSelfPosition: true;
      });

export default ThreeDotsMenuWithOptionalAnchorProps;
