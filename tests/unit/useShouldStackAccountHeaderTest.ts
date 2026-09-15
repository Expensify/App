import {renderHook} from '@testing-library/react-native';

import useShouldStackAccountHeader from '@hooks/useShouldStackAccountHeader';

import variables from '@styles/variables';

const mockResponsiveLayout = {shouldUseNarrowLayout: true};
const mockWindowDimensions = {windowWidth: 0, windowHeight: 0};

jest.mock('@hooks/useResponsiveLayout', () => () => mockResponsiveLayout);
jest.mock('@hooks/useWindowDimensions', () => () => mockWindowDimensions);

// A phone in landscape: the short edge becomes the height, leaving no room for the ~236dp stacked header.
const LANDSCAPE_PHONE_HEIGHT = 411;
const PORTRAIT_PHONE_HEIGHT = 915;

function renderWith({shouldUseNarrowLayout, windowHeight}: {shouldUseNarrowLayout: boolean; windowHeight: number}) {
    mockResponsiveLayout.shouldUseNarrowLayout = shouldUseNarrowLayout;
    mockWindowDimensions.windowHeight = windowHeight;
    return renderHook(() => useShouldStackAccountHeader()).result.current;
}

describe('useShouldStackAccountHeader', () => {
    it('stacks the header on a narrow layout that is tall enough', () => {
        expect(renderWith({shouldUseNarrowLayout: true, windowHeight: PORTRAIT_PHONE_HEIGHT})).toBe(true);
    });

    it('does not stack the header on a narrow layout that is too short, e.g. a phone in landscape', () => {
        expect(renderWith({shouldUseNarrowLayout: true, windowHeight: LANDSCAPE_PHONE_HEIGHT})).toBe(false);
    });

    it('does not stack the header when the viewport height is not known yet, so the compact row is what renders', () => {
        expect(renderWith({shouldUseNarrowLayout: true, windowHeight: 0})).toBe(false);
    });

    it('does not stack the header on a wide layout', () => {
        expect(renderWith({shouldUseNarrowLayout: false, windowHeight: PORTRAIT_PHONE_HEIGHT})).toBe(false);
    });

    it('stacks the header exactly at the breakpoint', () => {
        expect(renderWith({shouldUseNarrowLayout: true, windowHeight: variables.stackedAccountHeaderMinHeightBreakpoint})).toBe(true);
        expect(renderWith({shouldUseNarrowLayout: true, windowHeight: variables.stackedAccountHeaderMinHeightBreakpoint - 1})).toBe(false);
    });
});
