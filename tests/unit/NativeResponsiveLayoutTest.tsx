import {renderHook} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';

import {Dimensions} from 'react-native';

jest.mock('@hooks/useWindowDimensions', () => jest.fn());

describe('Native responsive breakpoints', () => {
    it.each([
        [800, 1200, true, false, false],
        [801, 1200, false, true, false],
        [1024, 768, false, true, false],
        [1180, 820, false, false, true],
    ])('keeps hook and router consistent at %i × %i', (width, height, isNarrow, isMedium, isLarge) => {
        // Given native tablets can cross the same width breakpoints as web without being forced into phone layout
        jest.mocked(useWindowDimensions).mockReturnValue({windowWidth: width, windowHeight: height});
        const spy = jest.spyOn(Dimensions, 'get').mockReturnValue({width, height, scale: 1, fontScale: 1});
        // When the layout hook reads the same window size used by the router
        const {result} = renderHook(() => useResponsiveLayout());

        // Then both must agree on the layout so routing cannot select a different pane structure from the rendered UI
        expect(result.current.isSmallScreenWidth).toBe(isNarrow);
        expect(result.current.shouldUseNarrowLayout).toBe(isNarrow);
        expect(result.current.isMediumScreenWidth).toBe(isMedium);
        expect(result.current.isLargeScreenWidth).toBe(isLarge);
        expect(getIsNarrowLayout()).toBe(isNarrow);
        spy.mockRestore();
    });
});
