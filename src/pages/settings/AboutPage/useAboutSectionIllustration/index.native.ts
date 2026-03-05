import LottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import type UseAboutSectionIllustration from './types';

const useAboutSectionIllustration: UseAboutSectionIllustration = () => {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['TiltedCoinExpensify']);
    const styles = useThemeStyles();

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations.TiltedCoinExpensify,
            illustrationStyle: styles.aboutStaticIllustration,
        };
    }

    return {
        illustration: LottieAnimations.Coin,
    };
};

export default useAboutSectionIllustration;
