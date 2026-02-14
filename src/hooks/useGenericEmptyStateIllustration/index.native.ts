import LottieAnimations from '@components/LottieAnimations';
import CONST from '@src/CONST';
import type UseGenericEmptyStateIllustration from './types';

const useGenericEmptyStateIllustration: UseGenericEmptyStateIllustration = () => {
    return {
        headerMediaType: CONST.EMPTY_STATE_MEDIA.ANIMATION,
        headerMedia: LottieAnimations.GenericEmptyState,
        headerContentStyles: [{width: '100%'}],
    };
};

export default useGenericEmptyStateIllustration;
