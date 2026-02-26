import React from 'react';
import Animated from 'react-native-reanimated';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    useConfirmReadyToOpenApp();

    return <Animated.View style={[styles.flex1]}>{shouldUseNarrowLayout ? <SearchPageNarrow /> : <SearchPageWide route={route} />}</Animated.View>;
}

SearchPage.whyDidYouRender = true;

export default SearchPage;
