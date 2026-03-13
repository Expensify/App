import LottieAnimations from '@components/LottieAnimations';
import useSectionIllustrationWithMotion from '@hooks/useSectionIllustrationWithMotion';
import useThemeStyles from '@hooks/useThemeStyles';
import type UsePreferencesSectionIllustration from './types';

const usePreferencesSectionIllustration: UsePreferencesSectionIllustration = () => {
    const styles = useThemeStyles();
    return useSectionIllustrationWithMotion(LottieAnimations.PreferencesDJ, 'DjBoothReferenceHands', styles.preferencesStaticIllustration);
};

export default usePreferencesSectionIllustration;
