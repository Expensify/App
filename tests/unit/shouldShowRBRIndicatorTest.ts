import type {ListItem} from '@components/SelectionList/ListItem/types';
import shouldShowRBRIndicator from '@components/SelectionList/utils/shouldShowRBRIndicator';

import CONST from '@src/CONST';

const ERROR = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;

const buildItem = (extra: Partial<ListItem> = {}): ListItem => ({text: 'Test User', keyForList: 'test-user', ...extra});

describe('shouldShowRBRIndicator', () => {
    it.each([
        ['an unselected item with a status', true, buildItem({brickRoadIndicator: ERROR}), undefined],
        ['an item without a status', false, buildItem(), undefined],
        ['an item with an empty status', false, buildItem({brickRoadIndicator: ''}), undefined],
        ['a selected item (via the item)', false, buildItem({brickRoadIndicator: ERROR, isSelected: true}), undefined],
        ['a selected item (via the override)', false, buildItem({brickRoadIndicator: ERROR}), true],
        ['an unselected override beating a selected item', true, buildItem({brickRoadIndicator: ERROR, isSelected: true}), false],
        ['a selected item that can show several indicators', true, buildItem({brickRoadIndicator: ERROR, isSelected: true, canShowSeveralIndicators: true}), undefined],
    ])('shows the indicator for %s: %s', (_label, expected, item, isSelected) => {
        expect(shouldShowRBRIndicator(item, isSelected)).toBe(expected);
    });
});
