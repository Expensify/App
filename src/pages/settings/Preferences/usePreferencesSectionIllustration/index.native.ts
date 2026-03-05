import LottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import type UsePreferencesSectionIllustration from './types';

const usePreferencesSectionIllustration: UsePreferencesSectionIllustration = () => {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['DjBoothReferenceHands']);
    const styles = useThemeStyles();

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations.DjBoothReferenceHands,
            illustrationStyle: styles.preferencesStaticIllustration,
        };
    }

    return {
        illustration: LottieAnimations.PreferencesDJ,
    };
};

export default usePreferencesSectionIllustration;
