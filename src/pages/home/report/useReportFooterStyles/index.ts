import type {ViewStyle} from 'react-native';
import type UseReportFooterStylesParams from './types';

function useReportFooterStyles({isComposerFullSize}: UseReportFooterStylesParams): ViewStyle {
    return {
        height: isComposerFullSize ? '100%' : 'auto',
    };
}

export default useReportFooterStyles;
