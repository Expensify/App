import useThemeStyles from '@hooks/useThemeStyles';

import type UseReportFooterStylesParams from './types';

const useReportFooterStyles = ({isComposerFullSize}: UseReportFooterStylesParams) => {
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
