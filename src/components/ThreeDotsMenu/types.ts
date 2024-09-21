import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {TranslationPaths} from '@src/languages/types';
import type {AnchorPosition} from '@src/styles';
import type {Modal} from '@src/types/onyx';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';

type ThreeDotsMenuOnyxProps = {
    /** Details about any modals being used */
    modal: OnyxEntry<Modal>;
};

type ThreeDotsMenuProps = ThreeDotsMenuOnyxProps & {
    /** Tooltip for the popup icon */
    iconTooltip?: TranslationPaths;

    /** icon for the popup trigger */
    icon?: IconAsset;

    /** Any additional styles to pass to the icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Function to call on icon press */
    onIconPress?: () => void;

    /** menuItems that'll show up on toggle of the popup menu */
    menuItems: PopoverMenuItem[];

    /** The anchor position of the menu */
    anchorPosition: AnchorPosition;

    /** The anchor alignment of the menu */
    anchorAlignment?: AnchorAlignment;

    /** Whether the popover menu should overlay the current view */
    shouldOverlay?: boolean;

    /** Whether the menu is disabled */
    disabled?: boolean;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;
    
    /** Is this in the Pane */
    isPaneMenu?: boolean;
};

export default ThreeDotsMenuProps;
