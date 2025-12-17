import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseSecuritySettingsSectionIllustration from './types';

const useSecuritySettingsSectionIllustration: UseSecuritySettingsSectionIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['Safe']);
    const styles = useThemeStyles();

    return {
        illustration: illustrations.Safe,
        illustrationStyle: styles.securitySettingsStaticIllustration,
    };
};

export default useSecuritySettingsSectionIllustration;
