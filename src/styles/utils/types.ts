import type {ImageStyle, PressableStateCallbackType, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type colors from '@styles/theme/colors';
import type variables from '@styles/variables';
import type CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';

type AllStyles = ViewStyle | TextStyle | ImageStyle;
type ParsableStyle = StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);

type ColorValue = ValueOf<typeof colors>;
type AvatarSizeName = ValueOf<typeof CONST.AVATAR_SIZE>;
type EReceiptColorName = ValueOf<typeof CONST.ERECEIPT_COLORS>;
type AvatarSizeValue = ValueOf<
    Pick<
        typeof variables,
        | 'avatarSizeNormal'
        | 'avatarSizeSmallSubscript'
        | 'avatarSizeMidSubscript'
        | 'avatarSizeSubscript'
        | 'avatarSizeSmall'
        | 'avatarSizeSmaller'
        | 'avatarSizeXLarge'
        | 'avatarSizeLarge'
        | 'avatarSizeMedium'
        | 'avatarSizeMediumLarge'
        | 'avatarSizeLargeBordered'
        | 'avatarSizeHeader'
        | 'avatarSizeMentionIcon'
        | 'avatarSizeSmallNormal'
        | 'avatarSizeLargeNormal'
    >
>;

type AvatarStyle = Dimensions & {
    borderRadius: number;
    backgroundColor: string;
};

type ButtonSizeValue = ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
type ButtonStateName = ValueOf<typeof CONST.BUTTON_STATES>;
type AvatarSize = {width: number};

type SVGAvatarColorStyle = {backgroundColor: ColorValue; fill: ColorValue};
type EreceiptColorStyle = {backgroundColor: ColorValue; color: ColorValue; titleColor: ColorValue};
type TextColorStyle = {color: string};
type ReportFooterStyle = {
    paddingTop?: number;
    paddingBottom?: number;
    headerHeight: number;
    isComposerFullSize?: boolean;
    isKeyboardActive: boolean;
    keyboardHeight: SharedValue<number>;
    windowHeight: number;
    composerHeight: number;
};

export type {
    AllStyles,
    ParsableStyle,
    ColorValue,
    AvatarSizeName,
    EReceiptColorName,
    AvatarSizeValue,
    AvatarStyle,
    ButtonSizeValue,
    ButtonStateName,
    AvatarSize,
    SVGAvatarColorStyle,
    EreceiptColorStyle,
    TextColorStyle,
    ReportFooterStyle,
};
