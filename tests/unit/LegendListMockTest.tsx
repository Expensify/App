import {render} from '@testing-library/react-native';

import {LegendList} from '@legendapp/list/react-native';
import {FlashList} from '@shopify/flash-list';

const DATA = ['first', 'second', 'third'];

function renderItem() {
    return null;
}

describe('LegendList Jest mock', () => {
    it('uses FlashList as its virtualized renderer', () => {
        const renderResult = render(
            <LegendList
                data={DATA}
                renderItem={renderItem}
            />,
        );

        expect(renderResult.UNSAFE_getByType(FlashList).props.data).toBe(DATA);
    });

    it('starts at the final item when initialScrollAtEnd is enabled', () => {
        const renderResult = render(
            <LegendList
                data={DATA}
                initialScrollAtEnd
                renderItem={renderItem}
            />,
        );
        const flashList = renderResult.UNSAFE_getByType(FlashList);

        expect(flashList.props.initialScrollIndex).toBe(DATA.length - 1);
        expect(flashList.props.initialScrollIndexParams).toEqual({viewPosition: 1});
    });
});
