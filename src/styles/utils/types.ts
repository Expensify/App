import {ImageStyle, PressableStateCallbackType, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {ValueOf} from 'type-fest';
import colors from '@styles/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';

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
        | 'avatarSizeLargeBordered'
        | 'avatarSizeHeader'
        | 'avatarSizeMentionIcon'
        | 'avatarSizeSmallNormal'
    >
>;

type AvatarStyle = {
    width: number;
    height: number;
    borderRadius: number;
    backgroundColor: string;
};

type ButtonSizeValue = ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
type ButtonStateName = ValueOf<typeof CONST.BUTTON_STATES>;
type AvatarSize = {width: number};

type WorkspaceColorStyle = {backgroundColor: ColorValue; fill: ColorValue};
type EreceiptColorStyle = {backgroundColor: ColorValue; color: ColorValue};

export type {
    AllStyles,
    ParsableStyle,
    ColorValue,
    AvatarSizeName,
    AvatarStyle,
    EReceiptColorName,
    AvatarSizeValue,
    ButtonSizeValue,
    ButtonStateName,
    AvatarSize,
    WorkspaceColorStyle,
    EreceiptColorStyle,
};
