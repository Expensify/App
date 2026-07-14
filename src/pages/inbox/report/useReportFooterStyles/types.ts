import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyleHandle} from 'react-native-reanimated/src/hook/commonTypes';

type UseReportFooterStylesParams = {
    headerHeight: number;
    composerHeight: number;
    isComposerFullSize?: boolean;
};

type UseReportFooterStyles = (params: UseReportFooterStylesParams) => StyleProp<ViewStyle> | AnimatedStyleHandle<ViewStyle>;

export type {UseReportFooterStylesParams, UseReportFooterStyles};
