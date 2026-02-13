import LottieAnimations from '@components/LottieAnimations';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseGenericEmptyStateIllustration from './types';

const useGenericEmptyStateIllustration: UseGenericEmptyStateIllustration = () => {
    const styles = useThemeStyles();

    return {
        headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
        headerMedia: LottieAnimations.GenericEmptyState,
        headerContentStyles: [styles.emptyStateFolderWebStyles],
        lottieWebViewStyles: styles.emptyStateFolderWebStyles,
    };
};

export default useGenericEmptyStateIllustration;
