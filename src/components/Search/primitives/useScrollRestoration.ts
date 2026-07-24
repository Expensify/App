import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';

import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';

import {useFocusEffect, useRoute} from '@react-navigation/native';
import {useCallback, useContext} from 'react';

/**
 * Restores the Search list's vertical scroll position when the screen regains focus.
 *
 * The offset is saved per route in ScrollOffsetContext by the page wrappers; on focus we read it back
 * and apply it to the FlashList on the next frame, so a back-navigation lands at the prior position
 * instead of the top. Extracted from SearchList so ExpenseFlatSearchView can reuse it.
 */
function useScrollRestoration<TItem>(listRef: RefObject<FlashListRef<TItem> | null>) {
    const route = useRoute();
    const {getScrollOffset} = useContext(ScrollOffsetContext);

    useFocusEffect(
        useCallback(() => {
            const offset = getScrollOffset(route);
            requestAnimationFrame(() => {
                if (!offset || !listRef.current) {
                    return;
                }

                listRef.current.scrollToOffset({offset, animated: false});
            });
        }, [getScrollOffset, route, listRef]),
    );
}

export default useScrollRestoration;
