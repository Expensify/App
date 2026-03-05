import LottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import type UseSaveTheWorldSectionIllustration from './types';

const useSaveTheWorldSectionIllustration: UseSaveTheWorldSectionIllustration = () => {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['SaveTheWorldScale']);
    const styles = useThemeStyles();

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations.SaveTheWorldScale,
            illustrationStyle: styles.saveTheWorldStaticIllustration,
        };
    }

    return {
        illustration: LottieAnimations.SaveTheWorld,
    };
};

export default useSaveTheWorldSectionIllustration;
