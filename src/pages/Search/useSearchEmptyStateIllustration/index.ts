import {useMemo} from 'react';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseSearchEmptyStateIllustration from './types';

const useSearchEmptyStateIllustration: UseSearchEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['FolderWithPapersAndWatch'] as const);
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    return useMemo(
        () => ({
            headerMediaType: CONST.EMPTY_STATE_MEDIA.ILLUSTRATION,
            headerMedia: illustrations.FolderWithPapersAndWatch,
            headerStyles: StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG),
            headerContentStyles: [styles.emptyStateFolderWebStyles, styles.emptyStateFolderStaticIllustration, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
        }),
        [StyleUtils, illustrations.FolderWithPapersAndWatch, styles.emptyStateFolderWebStyles, styles.emptyStateFolderStaticIllustration, theme.emptyFolderBG],
    );
};

export default useSearchEmptyStateIllustration;
