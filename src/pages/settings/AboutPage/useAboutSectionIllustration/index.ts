import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseAboutSectionIllustration from './types';

const useAboutSectionIllustration: UseAboutSectionIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['TiltedCoinExpensify'] as const);
    const styles = useThemeStyles();

    return {
        illustration: illustrations.TiltedCoinExpensify,
        illustrationStyle: styles.aboutStaticIllustration,
    };
};

export default useAboutSectionIllustration;
