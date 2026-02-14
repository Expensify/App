import LottieAnimations from '@components/LottieAnimations';
import CONST from '@src/CONST';
import type UseSearchEmptyStateIllustration from './types';

const useSearchEmptyStateIllustration: UseSearchEmptyStateIllustration = () => {
    return {
        fireworks: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
            headerMedia: LottieAnimations.Fireworks,
            headerContentStyles: [{width: '100%'}],
        },
        folder: {
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
            headerMedia: LottieAnimations.GenericEmptyState,
            headerContentStyles: [{width: '100%'}],
        },
    };
};

export default useSearchEmptyStateIllustration;
