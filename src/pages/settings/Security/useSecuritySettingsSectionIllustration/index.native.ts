import LottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import type UseSecuritySettingsSectionIllustration from './types';

const useSecuritySettingsSectionIllustration: UseSecuritySettingsSectionIllustration = () => {
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Safe']);
    const styles = useThemeStyles();

    if (isReduceMotionEnabled) {
        return {
            illustration: illustrations.Safe,
            illustrationStyle: styles.securitySettingsStaticIllustration,
        };
    }

    return {
        illustration: LottieAnimations.Safe,
    };
};

export default useSecuritySettingsSectionIllustration;
