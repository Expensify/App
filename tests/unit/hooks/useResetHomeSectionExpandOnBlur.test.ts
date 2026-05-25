import {renderHook} from '@testing-library/react-native';
import useResetHomeSectionExpandOnBlur from '@pages/home/useResetHomeSectionExpandOnBlur';

let focusEffectCleanup: (() => void) | undefined;
const mockUseResponsiveLayout = jest.fn<{shouldUseNarrowLayout: boolean}, []>();

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (cb: () => (() => void) | undefined) => {
        focusEffectCleanup = cb();
    },
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => mockUseResponsiveLayout(),
}));

describe('useResetHomeSectionExpandOnBlur', () => {
    beforeEach(() => {
        focusEffectCleanup = undefined;
        mockUseResponsiveLayout.mockReset();
    });

    it('calls reset on blur in wide layout', () => {
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false});
        const reset = jest.fn();

        renderHook(() => useResetHomeSectionExpandOnBlur(reset));
        focusEffectCleanup?.();

        expect(reset).toHaveBeenCalledTimes(1);
    });

    it('does not call reset in narrow layout', () => {
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true});
        const reset = jest.fn();

        renderHook(() => useResetHomeSectionExpandOnBlur(reset));

        expect(focusEffectCleanup).toBeUndefined();
        expect(reset).not.toHaveBeenCalled();
    });

    it('uses the latest reset callback after a re-render', () => {
        mockUseResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false});
        const firstReset = jest.fn();
        const secondReset = jest.fn();

        const {rerender} = renderHook(({reset}: {reset: () => void}) => useResetHomeSectionExpandOnBlur(reset), {initialProps: {reset: firstReset}});
        rerender({reset: secondReset});
        focusEffectCleanup?.();

        expect(firstReset).not.toHaveBeenCalled();
        expect(secondReset).toHaveBeenCalledTimes(1);
    });
});
