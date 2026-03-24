import LottieAnimations from '@components/LottieAnimations';
import useSectionIllustrationWithMotion from '@hooks/useSectionIllustrationWithMotion';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseSecuritySettingsSectionIllustration from './types';

const useSecuritySettingsSectionIllustration: UseSecuritySettingsSectionIllustration = () => {
    const styles = useThemeStyles();
    return useSectionIllustrationWithMotion(LottieAnimations.Safe, 'Safe', styles.securitySettingsStaticIllustration);
};

export default useSecuritySettingsSectionIllustration;
