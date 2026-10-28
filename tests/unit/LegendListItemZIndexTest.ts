import setLegendListItemZIndex from '@components/LegendList/setLegendListItemZIndex';

import type {LegendListRef} from '@legendapp/list/react-native';

import createMock from '../utils/createMock';

describe('setLegendListItemZIndex', () => {
    it('updates the native LegendList item container', () => {
        const setNativeProps = jest.fn();
        const list = createMock<LegendListRef>({
            getState: () =>
                createMock<ReturnType<LegendListRef['getState']>>({
                    elementAtIndex: () => ({setNativeProps}),
                }),
        });

        expect(setLegendListItemZIndex(list, 3, -3)).toBe(true);
        expect(setNativeProps).toHaveBeenCalledWith({style: {zIndex: -3}});
    });

    it('does nothing when the item container is not mounted', () => {
        const list = createMock<LegendListRef>({
            getState: () =>
                createMock<ReturnType<LegendListRef['getState']>>({
                    elementAtIndex: () => undefined,
                }),
        });

        expect(setLegendListItemZIndex(list, 3, -3)).toBe(false);
    });
});
