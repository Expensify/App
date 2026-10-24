import {act, renderHook} from '@testing-library/react-native';

import useSingleRHPWidth from '@hooks/useSingleRHPWidth';

import {setSingleRHPWidth} from '@libs/actions/SingleRHPWidth';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// jest-expo resolves bare specifiers to index.native.ts, where the wide RHP has no width, so the web module is loaded explicitly.
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'),
);

const WIDE_WINDOW_WIDTH = 1920;
const NARROW_WINDOW_WIDTH = 1100;

let mockWindowWidth = WIDE_WINDOW_WIDTH;
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: mockWindowWidth}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isExtraLargeScreenWidth: false}));
jest.mock('@hooks/useSidePanelState', () => () => ({shouldHideSidePanel: true}));

let mockIsResizableRHPEnabled = true;
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => mockIsResizableRHPEnabled}));

describe('useSingleRHPWidth', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockWindowWidth = WIDE_WINDOW_WIDTH;
        mockIsResizableRHPEnabled = true;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('starts at the default width before anything is saved', async () => {
        // Given a user who never dragged the single RHP
        // When its width is read
        const {result} = renderHook(() => useSingleRHPWidth());
        await waitForBatchedUpdates();

        // Then it is the default RHP width, so the beta changes nothing until a drag
        expect(result.current.width).toBe(variables.rhpWidth);
    });

    it('fits a saved width into a narrower window and restores it when the window grows back', async () => {
        // Given a saved width that only fits the wide window
        const savedWidth = getSingleRHPWidthBounds(WIDE_WINDOW_WIDTH, 0).max;
        const narrowMax = getSingleRHPWidthBounds(NARROW_WINDOW_WIDTH, 0).max;
        expect(narrowMax).toBeLessThan(savedWidth);
        const {result, rerender} = renderHook(() => useSingleRHPWidth());
        await act(async () => {
            setSingleRHPWidth(savedWidth);
            await waitForBatchedUpdates();
        });

        // When the window shrinks
        mockWindowWidth = NARROW_WINDOW_WIDTH;
        rerender({});

        // Then the card shrinks to the widest it can be there
        expect(result.current.width).toBe(narrowMax);

        // When the window grows back
        mockWindowWidth = WIDE_WINDOW_WIDTH;
        rerender({});

        // Then the card returns to the width the user dragged to, because the clamp never overwrote what was saved
        expect(result.current.width).toBe(savedWidth);
    });

    it('ignores a saved width once the beta is off', async () => {
        // Given a saved width left behind by a user whose beta was then turned off without clearing it
        const savedWidth = getSingleRHPWidthBounds(WIDE_WINDOW_WIDTH, 0).max;
        mockIsResizableRHPEnabled = false;
        const {result} = renderHook(() => useSingleRHPWidth());

        // When the width is read
        await act(async () => {
            setSingleRHPWidth(savedWidth);
            await waitForBatchedUpdates();
        });

        // Then it is the default width, because without the beta there is no handle to drag the card back
        expect(result.current.width).toBe(variables.rhpWidth);
    });

    it('keeps the default width in a window too narrow for it once the beta is off', async () => {
        // Given a user without the beta in a window whose resize bounds fall below the default width
        mockIsResizableRHPEnabled = false;
        mockWindowWidth = 805;
        expect(getSingleRHPWidthBounds(mockWindowWidth, 0).max).toBeLessThan(variables.rhpWidth);

        // When the width is read
        const {result} = renderHook(() => useSingleRHPWidth());
        await waitForBatchedUpdates();

        // Then it is still the default width, because the resize bounds belong to the beta and must not change the RHP for everyone else
        expect(result.current.width).toBe(variables.rhpWidth);
    });
});
