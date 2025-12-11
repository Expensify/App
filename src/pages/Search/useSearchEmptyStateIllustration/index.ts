import {useMemo} from 'react';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type UseSearchEmptyStateIllustration from './types';

const useSearchEmptyStateIllustration: UseSearchEmptyStateIllustration = () => {
    const illustrations = useMemoizedLazyIllustrations(['Fireworks', 'FolderWithPapersAndWatch'] as const);
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    return useMemo(
        () => ({
            fireworks: {
                headerMediaType: CONST.EMPTY_STATE_MEDIA.ILLUSTRATION,
                headerMedia: illustrations.Fireworks,
                headerStyles: StyleUtils.getBackgroundColorStyle(theme.todoBG),
                headerContentStyles: [styles.emptyStateFireworksStaticIllustration, StyleUtils.getBackgroundColorStyle(theme.todoBG)],
            },
            folder: {
                headerMediaType: CONST.EMPTY_STATE_MEDIA.ILLUSTRATION,
                headerMedia: illustrations.FolderWithPapersAndWatch,
                headerStyles: StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG),
                headerContentStyles: [styles.emptyStateFolderWebStyles, styles.emptyStateFolderStaticIllustration, StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
            },
        }),
        [
            illustrations.Fireworks,
            illustrations.FolderWithPapersAndWatch,
            StyleUtils,
            theme.todoBG,
            theme.emptyFolderBG,
            styles.emptyStateFireworksStaticIllustration,
            styles.emptyStateFolderWebStyles,
            styles.emptyStateFolderStaticIllustration,
        ],
    );
};

export default useSearchEmptyStateIllustration;
