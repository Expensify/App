import LottieAnimations from '@components/LottieAnimations';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseEmptyLHNIllustration from './types';

const useEmptyLHNIllustration: UseEmptyLHNIllustration = () => {
    const styles = useThemeStyles();

    return {
        animation: LottieAnimations.Fireworks,
        animationStyles: styles.emptyLHNAnimation,
        animationWebStyle: styles.emptyLHNAnimation,
    };
};

export default useEmptyLHNIllustration;
