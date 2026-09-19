import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';

import type {ButtonVariant} from '@styles/utils/types';

import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageStyle} from 'expo-image';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

type HeaderMedia = IconAsset;
type EmptyStateButton = {
    buttonText?: string;
    buttonAction?: () => void;
    buttonVariant?: ButtonVariant;
    icon?: IconAsset;
    isDisabled?: boolean;
    style?: StyleProp<ViewStyle>;
    innerStyles?: StyleProp<ViewStyle>;
    hoverStyles?: StyleProp<ViewStyle>;
    dropDownOptions?: Array<DropdownOption<ValueOf<typeof CONST.REPORT.ADD_EXPENSE_OPTIONS>>>;
};

type EmptyStateComponentProps = {
    headerMedia: IconAsset;
    title: string;
    titleStyles?: StyleProp<TextStyle>;
    subtitle?: string;
    subtitleStyles?: StyleProp<TextStyle>;
    children?: React.ReactNode;
    buttons?: EmptyStateButton[];
    containerStyles?: StyleProp<ViewStyle>;
    cardStyles?: StyleProp<ViewStyle>;
    cardContentStyles?: StyleProp<ViewStyle>;
    headerStyles?: StyleProp<ViewStyle>;
    foregroundStyles?: StyleProp<ViewStyle>;
    headerContentStyles?: StyleProp<ViewStyle & ImageStyle>;
    minModalHeight?: number;
    subtitleText?: React.ReactNode;
};

type GenericEmptyStateComponentProps = EmptyStateComponentProps;

export type {EmptyStateComponentProps, EmptyStateButton, GenericEmptyStateComponentProps, HeaderMedia};
