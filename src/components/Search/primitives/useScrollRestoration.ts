import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';

import type {LegendListRef} from '@legendapp/list/react-native';
import type {RefObject} from 'react';

import {useFocusEffect, useRoute} from '@react-navigation/native';
import {useContext} from 'react';

/**
 * Restores the Search list's vertical scroll position when the screen regains focus.
 *
 * The offset is saved per route in ScrollOffsetContext by the page wrappers; on focus we read it back
 * and apply it to the LegendList on the next frame, so a back-navigation lands at the prior position
 * instead of the top. Extracted from SearchList so ExpenseFlatSearchView can reuse it.
 */
function useScrollRestoration(listRef: RefObject<LegendListRef | null>) {
    const route = useRoute();
    const {getScrollOffset} = useContext(ScrollOffsetContext);

    useFocusEffect(() => {
        const offset = getScrollOffset(route);
        requestAnimationFrame(() => {
            if (!offset || !listRef.current) {
                return;
            }

            listRef.current.scrollToOffset({offset, animated: false});
        });
    });
}

export default useScrollRestoration;
