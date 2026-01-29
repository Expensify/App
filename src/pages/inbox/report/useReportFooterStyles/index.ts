import type {UseReportFooterStyles} from './types';

const useReportFooterStyles: UseReportFooterStyles = ({isComposerFullSize}) => {
    return {
        height: isComposerFullSize ? '100%' : 'auto',
    };
};

export default useReportFooterStyles;
