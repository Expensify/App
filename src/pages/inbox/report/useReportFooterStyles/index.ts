import useThemeStyles from '@hooks/useThemeStyles';

import type {UseReportFooterStyles} from './types';

const useReportFooterStyles: UseReportFooterStyles = ({isComposerFullSize}) => {
    const styles = useThemeStyles();

    return [
        {
            height: isComposerFullSize ? '100%' : 'auto',
        },
        styles.mb2,
        styles.pt5,
    ];
};

export default useReportFooterStyles;
