import type {Role, StyleProp, ViewStyle} from 'react-native';

type GetButtonStyle = (styles: {cursorPointer: ViewStyle}, isNested: boolean) => StyleProp<ViewStyle> | undefined;

type GetButtonRole = (isNested: boolean) => Role | undefined;

export type {GetButtonStyle, GetButtonRole};
