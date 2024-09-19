import type {ImageStyle} from 'expo-image';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import type TableRowSkeleton from '@components/Skeletons/TableRowSkeleton';
import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type ValidSkeletons = typeof SearchRowSkeleton | typeof TableRowSkeleton;
type MediaTypes = ValueOf<typeof CONST.EMPTY_STATE_MEDIA>;

type SharedProps<T> = {
    SkeletonComponent: ValidSkeletons;
    title: string;
    titleStyles?: StyleProp<TextStyle>;
    subtitle: string | React.ReactNode;
    buttonText?: string;
    buttonAction?: () => void;
    containerStyles?: StyleProp<ViewStyle>;
    headerStyles?: StyleProp<ViewStyle>;
    headerMediaType: T;
    headerContentStyles?: StyleProp<ViewStyle & ImageStyle>;
    minModalHeight?: number;
    canEmptyViewBeScrolled?: boolean;
};

type MediaType<HeaderMedia, T extends MediaTypes> = SharedProps<T> & {
    headerMedia: HeaderMedia;
};

type VideoProps = MediaType<string, 'video'>;
type IllustrationProps = MediaType<IconAsset, 'illustration'>;
type AnimationProps = MediaType<DotLottieAnimation, 'animation'>;

type EmptyStateComponentProps = VideoProps | IllustrationProps | AnimationProps;

type VideoLoadedEventType = {
    srcElement: {
        videoWidth: number;
        videoHeight: number;
    };
};

export type {EmptyStateComponentProps, VideoLoadedEventType};
