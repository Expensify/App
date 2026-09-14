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

        expect(allowLegendListItemOverflow(list, 3)).toBe(true);
        expect(style.contain).toBe('layout style');
    });

    it('does nothing for a native item container', () => {
        const list = createMock<LegendListRef>({
            getState: () =>
                createMock<ReturnType<LegendListRef['getState']>>({
                    elementAtIndex: () => ({setNativeProps: jest.fn()}),
                }),
        });

        expect(allowLegendListItemOverflow(list, 3)).toBe(false);
    });
});
