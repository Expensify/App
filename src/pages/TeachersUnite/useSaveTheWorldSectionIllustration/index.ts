import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type UseSaveTheWorldSectionIllustration from './types';

const useSaveTheWorldSectionIllustration: UseSaveTheWorldSectionIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['SaveTheWorldScale']);
    const styles = useThemeStyles();

    return {
        illustration: illustrations.SaveTheWorldScale,
        illustrationStyle: styles.saveTheWorldStaticIllustration,
    };
};

export default useSaveTheWorldSectionIllustration;
