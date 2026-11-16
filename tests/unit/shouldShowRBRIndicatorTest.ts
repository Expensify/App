import type {ListItem} from '@components/SelectionList/ListItem/types';
import shouldShowRBRIndicator from '@components/SelectionList/utils/shouldShowRBRIndicator';

import CONST from '@src/CONST';

const ERROR = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;

const buildItem = (extra: Partial<ListItem> = {}): ListItem => ({text: 'Test User', keyForList: 'test-user', ...extra});

describe('shouldShowRBRIndicator', () => {
    it.each([
        ['an unselected item with a status', true, buildItem({brickRoadIndicator: ERROR})],
        ['an item without a status', false, buildItem()],
        ['an item with an empty status', false, buildItem({brickRoadIndicator: ''})],
        ['a selected item', false, buildItem({brickRoadIndicator: ERROR, isSelected: true})],
        ['a selected item that can show several indicators', true, buildItem({brickRoadIndicator: ERROR, isSelected: true, canShowSeveralIndicators: true})],
    ])('shows the indicator for %s: %s', (_label, expected, item) => {
        expect(shouldShowRBRIndicator(item)).toBe(expected);
    });
});
