import LottieAnimations from '@components/LottieAnimations';
import {SAFE_DURATION_MS, SAFE_HAPTIC_PATTERN} from '@components/LottieAnimations/hapticPatterns';

import useSectionIllustrationWithMotion from '@hooks/useSectionIllustrationWithMotion';
import useThemeStyles from '@hooks/useThemeStyles';

import type UseSecuritySettingsSectionIllustration from './types';

const useSecuritySettingsSectionIllustration: UseSecuritySettingsSectionIllustration = () => {
    const styles = useThemeStyles();
    return useSectionIllustrationWithMotion(LottieAnimations.Safe, 'Safe', styles.securitySettingsStaticIllustration, {
        haptics: SAFE_HAPTIC_PATTERN,
        hapticsDurationMs: SAFE_DURATION_MS,
    });
};

export default useSecuritySettingsSectionIllustration;
