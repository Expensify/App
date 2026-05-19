import {renderHook} from '@testing-library/react-native';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';

const mockResponsiveLayout = jest.fn<{shouldUseNarrowLayout: boolean; isInLandscapeMode: boolean}, []>();
jest.mock('@hooks/useResponsiveLayout', () => () => mockResponsiveLayout());

describe('useShouldDisplayButtonsInSeparateLine', () => {
    it('should return true on narrow layout in portrait mode', () => {
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true, isInLandscapeMode: false});
        const {result} = renderHook(() => useShouldDisplayButtonsInSeparateLine());
        expect(result.current).toBe(true);
    });

    it('should return false on narrow layout in landscape mode', () => {
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true, isInLandscapeMode: true});
        const {result} = renderHook(() => useShouldDisplayButtonsInSeparateLine());
        expect(result.current).toBe(false);
    });

    it('should return false on wide layout in portrait mode', () => {
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false, isInLandscapeMode: false});
        const {result} = renderHook(() => useShouldDisplayButtonsInSeparateLine());
        expect(result.current).toBe(false);
    });

    it('should return false on wide layout in landscape mode', () => {
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false, isInLandscapeMode: true});
        const {result} = renderHook(() => useShouldDisplayButtonsInSeparateLine());
        expect(result.current).toBe(false);
    });
});
