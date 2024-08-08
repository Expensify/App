import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

function getContent(type: SearchDataTypes) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return {
                headerMedia: Illustrations.EmptyStateTravel,
                title: Localize.translateLocal('search.searchResults.emptyTripResults.title'),
                subtitle: Localize.translateLocal('search.searchResults.emptyTripResults.subtitle'),
                buttonText: Localize.translateLocal('search.searchResults.emptyTripResults.buttonText'),
                buttonAction: () => Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS),
            };
        case CONST.SEARCH.DATA_TYPES.TRANSACTION:
        case CONST.SEARCH.DATA_TYPES.REPORT:
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        case CONST.SEARCH.DATA_TYPES.INVOICE:
        default:
            return {
                headerMedia: Illustrations.EmptyState,
                title: Localize.translateLocal('search.searchResults.emptyResults.title'),
                subtitle: Localize.translateLocal('search.searchResults.emptyResults.subtitle'),
                buttonText: undefined,
                buttonAction: undefined,
            };
    }
}

function EmptySearchView({type}) {
    const styles = useThemeStyles();
    const content = getContent(type);

    return (
        <EmptyStateComponent
            SkeletonComponent={SearchRowSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
            headerMedia={content.headerMedia}
            headerStyles={styles.emptyFolderBG}
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
