import allowLegendListItemOverflow from '@components/LegendList/allowLegendListItemOverflow';

import type {LegendListRef} from '@legendapp/list/react-native';

import createMock from '../utils/createMock';

describe('allowLegendListItemOverflow', () => {
    it('removes paint containment from a web item container', () => {
        const style = {contain: 'paint layout style'};
        const list = createMock<LegendListRef>({
            getState: () =>
                createMock<ReturnType<LegendListRef['getState']>>({
                    elementAtIndex: () => ({style}),
                }),
        });

        allowLegendListItemOverflow(list, 3);
        expect(style.contain).toBe('layout style');
    });

    it('does nothing for a native item container', () => {
        const setNativeProps = jest.fn();
        const itemContainer = {setNativeProps};
        const list = createMock<LegendListRef>({
            getState: () =>
                createMock<ReturnType<LegendListRef['getState']>>({
                    elementAtIndex: () => itemContainer,
                }),
        });

        allowLegendListItemOverflow(list, 3);
        expect(itemContainer).toEqual({setNativeProps});
        expect(setNativeProps).not.toHaveBeenCalled();
    });
});
