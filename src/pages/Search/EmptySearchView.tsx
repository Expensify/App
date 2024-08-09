import React, {useMemo} from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
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
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const content = useMemo(() => {
        switch (type) {
            case CONST.SEARCH.DATA_TYPES.TRIP:
                return {
                    headerMedia: Illustrations.EmptyStateTravel,
                    headerStyles: StyleUtils.getBackgroundColorStyle(theme.travelBG),
                    title: translate('search.searchResults.emptyTripResults.title'),
                    subtitle: translate('search.searchResults.emptyTripResults.subtitle'),
                    buttonText: translate('search.searchResults.emptyTripResults.buttonText'),
                    buttonAction: () => Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS),
                };
            case CONST.SEARCH.DATA_TYPES.TRANSACTION:
            case CONST.SEARCH.DATA_TYPES.REPORT:
            case CONST.SEARCH.DATA_TYPES.EXPENSE:
            case CONST.SEARCH.DATA_TYPES.INVOICE:
            default:
                return {
                    headerMedia: Illustrations.EmptyState,
                    headerStyles: StyleUtils.getBackgroundColorStyle(theme.emptyFolderBG),
                    title: translate('search.searchResults.emptyResults.title'),
                    subtitle: translate('search.searchResults.emptyResults.subtitle'),
                    buttonText: undefined,
                    buttonAction: undefined,
                };
        }
    }, [type, StyleUtils, translate, theme]);

    return (
        <EmptyStateComponent
            SkeletonComponent={SearchRowSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
            headerMedia={content.headerMedia}
            headerStyles={content.headerStyles}
            headerContentStyles={styles.emptyStateFolderIconSize}
            title={content.title}
            subtitle={content.subtitle}
            buttonText={content.buttonText}
            buttonAction={content.buttonAction}
        />
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
