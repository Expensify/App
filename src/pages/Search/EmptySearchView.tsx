import React, {useMemo} from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import LottieAnimations from '@components/LottieAnimations';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type EmptySearchViewProps = {
    type: SearchDataTypes;
};

function EmptySearchView({type}: EmptySearchViewProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const content = useMemo(() => {
        switch (type) {
            case CONST.SEARCH.DATA_TYPES.TRIP:
                return {
                    headerMedia: LottieAnimations.TripsEmptyState,
                    headerStyles: [StyleUtils.getBackgroundColorStyle(theme.travelBG), styles.w100],
                    title: translate('search.searchResults.emptyTripResults.title'),
                    subtitle: translate('search.searchResults.emptyTripResults.subtitle'),
                    buttonText: translate('search.searchResults.emptyTripResults.buttonText'),
                    buttonAction: () => Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS),
                };
            case CONST.SEARCH.DATA_TYPES.CHAT:
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
            case CONST.SEARCH.DATA_TYPES.INVOICE:
            default:
                return {
                    headerMedia: LottieAnimations.GenericEmptyState,
                    headerStyles: [StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG)],
                    title: translate('search.searchResults.emptyResults.title'),
                    subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    buttonText: undefined,
                    buttonAction: undefined,
                    lottieWebViewStyles: {...styles.w100, minWidth: 300},
                };
        }
    }, [type, StyleUtils, translate, theme, styles.w100]);

    return (
        <EmptyStateComponent
            SkeletonComponent={SearchRowSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
            headerMedia={content.headerMedia}
            headerStyles={[content.headerStyles, styles.emptyStateCardIllustrationContainer, styles.alignItemsCenter, styles.mvAuto]}
            title={content.title}
            subtitle={content.subtitle}
            buttonText={content.buttonText}
            buttonAction={content.buttonAction}
            headerContentStyles={[styles.h100, styles.w100]}
            lottieWebViewStyles={{...content.lottieWebViewStyles, ...styles.mtAuto, ...styles.mbAuto, ...styles.alignItemsCenter, ...styles.dFlex}}
        />
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
