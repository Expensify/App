import type {ImageStyle} from 'expo-image';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type MediaTypes = ValueOf<typeof CONST.EMPTY_STATE_MEDIA>;
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

type SharedProps<TMediaType> = {
    title: string;
    titleStyles?: StyleProp<TextStyle>;
    subtitle?: string;
    children?: React.ReactNode;
    buttons?: EmptyStateButton[];
    containerStyles?: StyleProp<ViewStyle>;
    cardStyles?: StyleProp<ViewStyle>;
    cardContentStyles?: StyleProp<ViewStyle>;
    headerStyles?: StyleProp<ViewStyle>;
    headerMediaType: TMediaType;
    headerContentStyles?: StyleProp<ViewStyle & ImageStyle>;
    minModalHeight?: number;
    subtitleText?: React.ReactNode;
};

type MediaType<THeaderMedia, TMediaType extends MediaTypes> = SharedProps<TMediaType> & {
    headerMedia: THeaderMedia;
};

type IllustrationProps = MediaType<IconAsset, 'illustration'>;

type EmptyStateComponentProps = IllustrationProps;
type GenericEmptyStateComponentProps = SharedProps<MediaTypes> & {headerMedia: HeaderMedia};

export type {EmptyStateComponentProps, EmptyStateButton, GenericEmptyStateComponentProps, MediaTypes, HeaderMedia};
