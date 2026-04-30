import type {ReactNode, Ref} from 'react';
import type {GestureResponderEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

type ItemPresentationProps = WithSentryLabel & {
    text: string;
    icon?: IconAsset;
    iconWidth?: number;
    iconHeight?: number;
    iconFill?: string;
    additionalIconStyles?: StyleProp<ViewStyle>;
    iconDescription?: string;
    description?: string;
    descriptionTextStyle?: StyleProp<TextStyle>;
    titleStyle?: StyleProp<TextStyle>;
    numberOfLinesTitle?: number;
    wrapperStyle?: StyleProp<ViewStyle>;
    displayInDefaultIconColor?: boolean;
    shouldShowLoadingSpinnerIcon?: boolean;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
    interactive?: boolean;
    disabled?: boolean;
    isSelected?: boolean;
};

type DropdownOptionV2Props = ItemPresentationProps & {
    onSelected?: () => void;
    keepOpen?: boolean;
};

/** Only one level of nesting is supported. */
type DropdownSubmenuV2Props = ItemPresentationProps & {
    backButtonText?: string;
    /** `<Option>` descriptors as direct children. Wrapping breaks render-order ordering. */
    children: ReactNode;
};

type PrimaryButtonProps = WithSentryLabel & {
    children: ReactNode;
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void;
    icon?: IconAsset;
    isDisabled?: boolean;
    ref?: Ref<View>;
};

type CaretProps = WithSentryLabel & {
    accessibilityLabel?: string;
    ref?: Ref<View>;
};

type TriggerProps = WithSentryLabel & {
    text?: string;
    /** When set, the consumer owns the entire button content — `text` and the auto-attached caret are skipped. */
    children?: ReactNode;
    icon?: IconAsset;
    style?: StyleProp<ViewStyle>;
    disabledStyle?: StyleProp<ViewStyle>;
    ref?: Ref<View>;
};

type MenuProps = {
    /** `<Option>` and `<Submenu>` descriptors as direct children. Wrapping breaks render-order ordering. */
    children: ReactNode;
    headerText?: string;
    layout?: 'fixed' | 'scrollable';
    padding?: 'modal' | 'tight';
    selectionMarker?: 'check' | 'none';
    containerStyles?: StyleProp<ViewStyle>;
    anchorAlignment?: AnchorAlignment;
};

type ButtonWithDropdownMenuV2Props = WithSentryLabel & {
    children?: ReactNode;
    /** Controlled mode — when set, the consumer owns open/close state. Pair with `onOpenChange`. */
    open?: boolean;
    /** Uncontrolled-mode initial value (ignored when `open` is set). */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    success?: boolean;
    isLoading?: boolean;
    isDisabled?: boolean;
    shouldStayNormalOnDisable?: boolean;
    pressOnEnter?: boolean;
    useKeyboardShortcuts?: boolean;
    enterKeyEventListenerPriority?: number;
    buttonSize?: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
    triggerLayout?: 'default' | 'compact';
    wrapperStyle?: StyleProp<ViewStyle>;
    testID?: string;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

export type {ButtonWithDropdownMenuV2Props, CaretProps, DropdownOptionV2Props, DropdownSubmenuV2Props, ItemPresentationProps, MenuProps, PrimaryButtonProps, TriggerProps};
