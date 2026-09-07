import type colors from '@styles/theme/colors';

import type CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';

import type {ImageStyle, PressableStateCallbackType, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

type AllStyles = ViewStyle | TextStyle | ImageStyle;
type ParsableStyle = StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);

type ColorValue = ValueOf<typeof colors>;
type AvatarSizeName = ValueOf<typeof CONST.AVATAR_SIZE>;
type AvatarShape = ValueOf<typeof CONST.AVATAR_SHAPE>;
type EReceiptColorName = ValueOf<typeof CONST.ERECEIPT_COLORS>;

type AvatarStyle = Dimensions & {
    borderRadius: number;
    backgroundColor: string;
};

type ButtonSizeValue = ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
type ButtonStateName = ValueOf<typeof CONST.BUTTON_STATES>;
type ButtonVariant = ValueOf<typeof CONST.BUTTON_VARIANT>;
type ButtonVariantStyles = {
    normal: Record<ButtonVariant, StyleProp<ViewStyle>>;
    disabled: Record<ButtonVariant, StyleProp<ViewStyle>>;
};

type GetIconFillColorParams = {
    /** Interaction state of the pressable the icon belongs to, usually built with `getButtonState` */
    buttonState?: ButtonStateName;

    /** Whether the icon sits inside a menu row, e.g. `MenuItem` */
    isMenuIcon?: boolean;

    /** Whether the icon sits in a pane, e.g. Account or Workspace Settings */
    isPane?: boolean;
};

type SVGAvatarColorStyle = {backgroundColor: ColorValue; fill: ColorValue};
type EreceiptColorStyle = {
    backgroundColor: ColorValue;
    color: ColorValue;
    titleColor: ColorValue;
};
type TextColorStyle = {color: string};

export type {
    AllStyles,
    ParsableStyle,
    ColorValue,
    AvatarShape,
    AvatarSizeName,
    EReceiptColorName,
    AvatarStyle,
    ButtonSizeValue,
    ButtonStateName,
    ButtonVariant,
    ButtonVariantStyles,
    GetIconFillColorParams,
    SVGAvatarColorStyle,
    EreceiptColorStyle,
    TextColorStyle,
};
