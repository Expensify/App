import React from 'react';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useConfirmReadyToOpenApp();

    if (shouldUseNarrowLayout) {
        return <SearchPageNarrow />;
    }
    return <SearchPageWide route={route} />;
}

SearchPage.whyDidYouRender = true;

export default SearchPage;
