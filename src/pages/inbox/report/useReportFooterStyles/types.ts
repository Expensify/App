import type {ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';

type UseReportFooterStylesParams = {
    headerHeight: number;
    composerHeight: number;
    isComposerFullSize?: boolean;
};

type UseReportFooterStyles = (params: UseReportFooterStylesParams) => ViewStyle | AnimatedStyle<ViewStyle>;

export type {UseReportFooterStylesParams, UseReportFooterStyles};
