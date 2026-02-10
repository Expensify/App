import LottieAnimations from '@components/LottieAnimations';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseSearchEmptyStateIllustration from './types';

const useSearchEmptyStateIllustration: UseSearchEmptyStateIllustration = () => {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    return {
        fireworks: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
            headerMedia: LottieAnimations.Fireworks,
            headerContentStyles: [StyleUtils.getWidthAndHeightStyle(375, 240)],
            lottieWebViewStyles: styles.emptyStateFireworksWebStyles,
        },
        folder: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
            headerMedia: LottieAnimations.GenericEmptyState,
            headerContentStyles: [styles.emptyStateFolderWebStyles],
            lottieWebViewStyles: styles.emptyStateFolderWebStyles,
        },
    };
};

export default useSearchEmptyStateIllustration;
