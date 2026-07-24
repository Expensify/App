import {getSearchPreInsertNavigation, SEARCH_PRE_INSERT_NAVIGATION} from '@pages/iou/request/step/confirmation/getSearchPreInsertNavigation';

describe('getSearchPreInsertNavigation', () => {
    it('reveals the Search route before dismissing for native-shortcut flows', () => {
        expect(getSearchPreInsertNavigation(true)).toBe(SEARCH_PRE_INSERT_NAVIGATION.REVEAL_SEARCH);
    });

    it('does a plain modal dismiss for non-native-shortcut flows', () => {
        expect(getSearchPreInsertNavigation(false)).toBe(SEARCH_PRE_INSERT_NAVIGATION.DISMISS_MODAL);
    });
});
