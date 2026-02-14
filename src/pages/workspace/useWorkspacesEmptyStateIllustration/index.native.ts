import LottieAnimations from '@components/LottieAnimations';
import CONST from '@src/CONST';
import type UseWorkspacesEmptyStateIllustration from './types';

const useWorkspacesEmptyStateIllustration: UseWorkspacesEmptyStateIllustration = () => {
    return {
        headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
        headerMedia: LottieAnimations.WorkspacePlanet,
        headerContentStyles: [{width: '100%'}],
    };
};

export default useWorkspacesEmptyStateIllustration;
