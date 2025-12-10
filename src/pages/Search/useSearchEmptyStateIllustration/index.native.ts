import {useMemo} from 'react';
import LottieAnimations from '@components/LottieAnimations';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseSearchEmptyStateIllustration from './types';

const useSearchEmptyStateIllustration: UseSearchEmptyStateIllustration = () => {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    return useMemo(
        () => ({
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
            headerMedia: LottieAnimations.GenericEmptyState,
            headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
            lottieWebViewStyles: {backgroundColor: theme.emptyFolderBG, ...styles.emptyStateFolderWebStyles},
        }),
        [StyleUtils, styles.emptyStateFolderWebStyles, theme.emptyFolderBG],
    );
};

export default useSearchEmptyStateIllustration;
