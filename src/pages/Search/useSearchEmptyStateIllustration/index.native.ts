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

    return {
        fireworks: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
            headerMedia: LottieAnimations.Fireworks,
            headerStyles: StyleUtils.getBackgroundColorStyle(theme.todoBG),
            headerContentStyles: [StyleUtils.getWidthAndHeightStyle(375, 240), StyleUtils.getBackgroundColorStyle(theme.todoBG)],
            lottieWebViewStyles: styles.emptyStateFireworksWebStyles,
        },
        folder: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
            headerMedia: LottieAnimations.GenericEmptyState,
            headerContentStyles: [styles.emptyStateFolderWebStyles, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
            lottieWebViewStyles: {backgroundColor: theme.emptyFolderBG, ...styles.emptyStateFolderWebStyles},
        },
    };
};

export default useSearchEmptyStateIllustration;
