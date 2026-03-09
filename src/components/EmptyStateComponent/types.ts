import type {ImageStyle} from 'expo-image';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type IconAsset from '@src/types/utils/IconAsset';

type HeaderMedia = IconAsset;
type EmptyStateButton = {
    buttonText?: string;
    buttonAction?: () => void;
    success?: boolean;
    icon?: IconAsset;
    isDisabled?: boolean;
    style?: StyleProp<ViewStyle>;
    dropDownOptions?: Array<
        DropdownOption<
            ValueOf<{readonly CREATE_NEW_EXPENSE: 'createNewExpense'; readonly TRACK_DISTANCE_EXPENSE: 'trackDistanceExpense'; readonly ADD_UNREPORTED_EXPENSE: 'addUnreportedExpense'}>
        >
    >;
};

type EmptyStateComponentProps = {
    headerMedia: IconAsset;
    title: string;
    titleStyles?: StyleProp<TextStyle>;
    subtitle?: string;
    children?: React.ReactNode;
    buttons?: EmptyStateButton[];
    containerStyles?: StyleProp<ViewStyle>;
    cardStyles?: StyleProp<ViewStyle>;
    cardContentStyles?: StyleProp<ViewStyle>;
    headerStyles?: StyleProp<ViewStyle>;
    headerContentStyles?: StyleProp<ViewStyle & ImageStyle>;
    minModalHeight?: number;
    subtitleText?: React.ReactNode;
};

type GenericEmptyStateComponentProps = EmptyStateComponentProps;

export type {EmptyStateComponentProps, EmptyStateButton, GenericEmptyStateComponentProps, HeaderMedia};
