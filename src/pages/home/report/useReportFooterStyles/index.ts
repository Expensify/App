import type {ViewStyle} from 'react-native';
import type UseReportFooterStylesParams from './types';

export default function useReportFooterStyles({isComposerFullSize}: UseReportFooterStylesParams): ViewStyle {
    return {
        height: isComposerFullSize ? '100%' : 'auto',
    };
}
