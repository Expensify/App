import LottieAnimations from '@components/LottieAnimations';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseWorkspacesEmptyStateIllustration from './types';

const useWorkspacesEmptyStateIllustration: UseWorkspacesEmptyStateIllustration = () => {
    const styles = useThemeStyles();

    return {
        headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
        headerMedia: LottieAnimations.WorkspacePlanet,
        headerContentStyles: styles.emptyWorkspaceListLottieIllustrationStyle,
        lottieWebViewStyles: styles.emptyWorkspaceListLottieIllustrationStyle,
    };
};

export default useWorkspacesEmptyStateIllustration;
