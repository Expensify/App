import React, {useCallback, useContext} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import Animated from 'react-native-reanimated';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
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
    const {saveScrollOffset} = useContext(ScrollOffsetContext);

    useConfirmReadyToOpenApp();

    const scrollHandler = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!e.nativeEvent.contentOffset.y) {
                return;
            }

            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [saveScrollOffset, route],
    );

    return <Animated.View style={[styles.flex1]}>{shouldUseNarrowLayout ? <SearchPageNarrow /> : <SearchPageWide scrollHandler={scrollHandler} />}</Animated.View>;
}

SearchPage.whyDidYouRender = true;

export default SearchPage;
